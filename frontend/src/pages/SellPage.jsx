import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImagePlus, Sparkles, X, ShieldCheck, ChevronRight, ChevronLeft, Check, CheckCircle2, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useUi } from "../context/UiContext";
import { categories, conditions, meetupSpots } from "../utils/constants";
import PageTransition from "../components/PageTransition";
import imageCompression from "browser-image-compression";

const steps = [
  { id: 1, title: "The Basics", desc: "What are you listing?" },
  { id: 2, title: "Details", desc: "Describe the item" },
  { id: 3, title: "Media", desc: "Upload photos" },
  { id: 4, title: "Logistics", desc: "Safety & Publish" }
];

const SellPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notify } = useUi();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [dynamicSpots, setDynamicSpots] = useState([]);
  const [showSpotRequest, setShowSpotRequest] = useState(false);
  const [newSpotName, setNewSpotName] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", price: "",
    category: searchParams.get("category") || "Books",
    condition: "Good",
    tags: "", campusMeetupSpots: [],
    lostFoundType: "lost"
  });

  useEffect(() => {
    api.get("/spots").then(res => setDynamicSpots(res.data.map(s => s.name))).catch(() => {});
  }, []);

  const allSpots = useMemo(() => {
    const spots = new Set([...meetupSpots, ...dynamicSpots]);
    return Array.from(spots);
  }, [dynamicSpots]);

  const quality = useMemo(() => {
    let score = 20;
    if (form.title.length >= 12) score += 10;
    if (form.description.length >= 80) score += 20;
    if (Number(form.price) > 0 || form.category === "Campus Radar") score += 10;
    if (files.length >= 1) score += 15;
    if (files.length >= 3) score += 10;
    if (form.campusMeetupSpots.length) score += 10;
    if (form.tags.split(",").filter(Boolean).length >= 2) score += 5;
    if (videoFile) score += 15;
    return Math.min(score, 100);
  }, [form, files, videoFile]);

  const qualityColor = quality >= 80 ? "from-brand to-accent" : quality >= 50 ? "from-amber-400 to-amber-500" : "from-coral to-rose-600";

  const update = (e) => setForm(old => ({ ...old, [e.target.name]: e.target.value }));
  const toggleSpot = (spot) => setForm(old => ({
    ...old,
    campusMeetupSpots: old.campusMeetupSpots.includes(spot)
      ? old.campusMeetupSpots.filter(s => s !== spot)
      : [...old.campusMeetupSpots, spot]
  }));

  const removeFile = (idx) => setFiles(old => old.filter((_, i) => i !== idx));
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  const videoPreview = useMemo(() => videoFile ? URL.createObjectURL(videoFile) : null, [videoFile]);

  useEffect(() => () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
  }, [previews, videoPreview]);

  const handleImageUpload = async (e) => {
    const selectedFiles = [...e.target.files].slice(0, 5);
    setLoading(true);
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFiles = await Promise.all(
        selectedFiles.map((file) => imageCompression(file, options))
      );
      setFiles(compressedFiles);
    } catch (error) {
      notify("Failed to compress images", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.title || form.title.length < 5) {
        notify("Please enter a clear title (at least 5 characters).", "error");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!form.description || form.description.length < 20) {
        notify("Description should be at least 20 characters.", "error");
        return false;
      }
      if (form.category !== "Campus Radar" && (!form.price || Number(form.price) <= 0)) {
        notify("Please set a valid price.", "error");
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(curr => Math.min(curr + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(curr => Math.max(curr - 1, 1));
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;
    if (form.campusMeetupSpots.length === 0) {
      notify("Please select at least one safe meetup spot.", "error");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (form.category === "Campus Radar") {
          if (k === "price") v = 0;
          if (k === "condition") v = "Fair";
        } else {
          if (k === "lostFoundType") return;
        }

        if (k === "tags") body.append(k, JSON.stringify(v.split(",").map(t => t.trim()).filter(Boolean)));
        else if (Array.isArray(v)) body.append(k, JSON.stringify(v));
        else body.append(k, v);
      });
      files.forEach(file => body.append("images", file));
      if (videoFile) body.append("video", videoFile);
      const { data } = await api.post("/listings", body, { headers: { "Content-Type": "multipart/form-data" } });
      notify("Listing published successfully!", "success");
      navigate(`/listings/${data._id}`);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to create listing", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitSpotRequest = async () => {
    if (!newSpotName.trim()) return notify("Please enter a spot name", "error");
    try {
      await api.post("/spots/request", { name: newSpotName });
      notify("Spot requested successfully. Awaiting admin approval.", "success");
      setNewSpotName("");
      setShowSpotRequest(false);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to request spot", "error");
    }
  };

  const inputCls = "w-full rounded-xl border border-border bg-elevated backdrop-blur-md px-4 py-3.5 text-sm text-ink placeholder:text-muted/60 transition-all outline-none focus:border-brand/60 focus:bg-card focus:ring-4 focus:ring-brand/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]";

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-4">
        
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative z-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex flex-col items-center relative z-10 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 shadow-sm
                  ${currentStep === s.id ? "bg-brand text-white scale-110 shadow-brand/20 shadow-lg border-2 border-white" : 
                    currentStep > s.id ? "bg-brand/20 text-brand border border-brand/30" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                  {currentStep > s.id ? <Check size={18} /> : s.id}
                </div>
                <div className="mt-3 text-center hidden sm:block">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= s.id ? "text-brand" : "text-muted/60"}`}>Step {s.id}</p>
                  <p className={`text-xs font-bold mt-0.5 ${currentStep >= s.id ? "text-ink" : "text-muted"}`}>{s.title}</p>
                </div>
              </div>
            ))}
            {/* Progress line */}
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-slate-100 -z-10 rounded-full overflow-hidden hidden sm:block">
              <div className="h-full bg-brand transition-all duration-500" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Wizard Form Area */}
        <div className="glass-3d rounded-[2rem] border border-border bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
          <div className="p-6 sm:p-10">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
              >
                
                {/* STEP 1: BASICS */}
                {currentStep === 1 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-ink">Let's start with the basics</h2>
                      <p className="text-muted mt-2">What kind of item are you looking to list?</p>
                    </div>

                    <div>
                      <label className="label">Category</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map(c => (
                          <div 
                            key={c}
                            onClick={() => setForm(old => ({...old, category: c}))}
                            className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-300 ${
                              form.category === c 
                                ? "border-brand bg-brand/5 shadow-sm scale-[1.02]" 
                                : "border-border bg-elevated hover:border-brand/30 hover:bg-card"
                            }`}
                          >
                            <p className={`font-bold text-sm ${form.category === c ? "text-brand" : "text-ink"}`}>{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label">Title</label>
                      <input 
                        name="title" 
                        value={form.title} 
                        onChange={update} 
                        placeholder="e.g. Engineering Maths textbook, 3rd sem" 
                        className={inputCls} 
                        autoFocus
                      />
                      <p className="text-[10px] text-muted mt-1.5 ml-2 font-semibold">Make it catchy! A good title attracts more buyers.</p>
                    </div>
                  </div>
                )}

                {/* STEP 2: DETAILS */}
                {currentStep === 2 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-ink">Fill in the details</h2>
                      <p className="text-muted mt-2">The more info, the faster it sells.</p>
                    </div>

                    <div>
                      <label className="label">Description</label>
                      <textarea 
                        name="description" 
                        value={form.description} 
                        onChange={update} 
                        placeholder="Describe condition, age, bill/warranty, reason for selling..." 
                        rows={5} 
                        className={`${inputCls} resize-none`} 
                        autoFocus
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {form.category !== "Campus Radar" && (
                        <>
                          <div>
                            <label className="label">Price (Rs.)</label>
                            <input name="price" value={form.price} onChange={update} type="number" min="0" placeholder="0" className={inputCls} />
                          </div>
                          <div>
                            <label className="label">Condition</label>
                            <select name="condition" value={form.condition} onChange={update} className={inputCls}>
                              {conditions.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      {form.category === "Campus Radar" && (
                        <div className="col-span-2">
                          <label className="label">Type</label>
                          <select name="lostFoundType" value={form.lostFoundType} onChange={update} className={inputCls}>
                            <option value="lost">I lost this item</option>
                            <option value="found">I found this item</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="label">Tags</label>
                      <input name="tags" value={form.tags} onChange={update} placeholder="e.g. CSE, calculator, first-year (comma separated)" className={inputCls} />
                    </div>
                  </div>
                )}

                {/* STEP 3: MEDIA */}
                {currentStep === 3 && (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-ink">Show it off</h2>
                      <p className="text-muted mt-2">Upload up to 5 clear photos.</p>
                    </div>

                    <div>
                      <label className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 bg-brand/5 p-12 text-center cursor-pointer hover:bg-brand/10 hover:border-brand/50 transition-all duration-300">
                        <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <ImagePlus className="text-brand" size={28} />
                        </div>
                        <span className="text-base font-black text-ink">Drag & drop or click to upload</span>
                        <span className="text-xs font-semibold text-muted mt-2">PNG, JPG, WebP - Max 5 MB each</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      
                      {files.length > 0 && (
                        <div className="flex gap-3 mt-6 flex-wrap justify-center">
                          {files.map((file, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={idx} 
                              className="relative group rounded-xl overflow-hidden shadow-sm"
                            >
                              <img src={previews[idx]} alt="preview" className="h-28 w-28 object-cover border-2 border-white/50" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button
                                  type="button"
                                  onClick={() => removeFile(idx)}
                                  className="h-8 w-8 rounded-full bg-coral text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              <span className="absolute bottom-1.5 left-1.5 bg-brand text-white rounded w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm">{idx + 1}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Video Upload Section */}
                      <div className="mt-8">
                        <label className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent/30 bg-accent/5 p-12 text-center cursor-pointer hover:bg-accent/10 hover:border-accent/50 transition-all duration-300">
                          <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Video className="text-accent" size={28} />
                          </div>
                          <span className="text-base font-black text-ink">Upload a Reel (Optional)</span>
                          <span className="text-xs font-semibold text-muted mt-2">MP4, WebM - Max 50 MB</span>
                          <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setVideoFile(e.target.files[0])} className="hidden" />
                        </label>

                        {videoFile && videoPreview && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group rounded-xl overflow-hidden shadow-sm mt-6 w-full max-w-[200px] mx-auto aspect-[9/16]"
                          >
                            <video src={videoPreview} autoPlay loop muted playsInline className="h-full w-full object-cover border-2 border-white/50 bg-black" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <button
                                type="button"
                                onClick={() => setVideoFile(null)}
                                className="h-10 w-10 rounded-full bg-coral text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: LOGISTICS & REVIEW */}
                {currentStep === 4 && (
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-black text-ink">Ready to go live</h2>
                      <p className="text-muted mt-2">Set your meetup preferences and publish.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Meetup spots */}
                      <div className="rounded-2xl border border-emerald-500/30 bg-elevated/50 backdrop-blur-md p-6 shadow-sm">
                        <label className="text-base font-black text-emerald-600 flex items-center gap-2 mb-1"><ShieldCheck size={20} className="text-emerald-500" /> Campus Safe Zones</label>
                        <p className="text-xs font-semibold text-emerald-600/80 mb-4">Select at least one secure spot for physical handover.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {allSpots.map(spot => (
                            <button
                              type="button"
                              key={spot}
                              onClick={() => toggleSpot(spot)}
                              className={`rounded-xl border-2 px-4 py-3 text-xs font-black text-left transition-all ${
                                form.campusMeetupSpots.includes(spot)
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                  : "border-border bg-card text-ink hover:border-emerald-400 hover:text-emerald-500"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                {spot}
                                {form.campusMeetupSpots.includes(spot) && <CheckCircle2 size={16} />}
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-emerald-500/20">
                          {!showSpotRequest ? (
                            <button type="button" onClick={() => setShowSpotRequest(true)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">Spot not listed? Request a new one</button>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <input value={newSpotName} onChange={e => setNewSpotName(e.target.value)} placeholder="E.g. Main Library Floor 2" className="flex-1 input text-xs py-2 h-9" />
                              <button type="button" onClick={submitSpotRequest} className="btn-primary text-xs px-3 h-9 flex-shrink-0">Request</button>
                              <button type="button" onClick={() => setShowSpotRequest(false)} className="btn-secondary text-xs px-2 h-9 flex-shrink-0 border-border"><X size={14}/></button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quality Score Review */}
                      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-5">
                          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${qualityColor} flex items-center justify-center shadow-lg`}>
                            <Sparkles className="text-white" size={24} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-muted uppercase tracking-widest">Listing Quality</p>
                            <p className="text-4xl font-black text-ink">{quality}%</p>
                          </div>
                        </div>

                        <div className="h-2.5 rounded-full bg-elevated overflow-hidden mb-4 shadow-inner border border-border">
                          <div className={`h-full rounded-full bg-gradient-to-r ${qualityColor} transition-all duration-1000`} style={{ width: `${quality}%` }} />
                        </div>

                        <div className="space-y-2 text-[11px] font-bold text-muted">
                          {[
                            { done: form.title.length >= 12,                    label: "Title is descriptive" },
                            { done: form.description.length >= 80,              label: "Description is detailed" },
                            { done: Number(form.price) > 0 || form.category === "Campus Radar", label: "Price is set" },
                            { done: files.length >= 1,                          label: "Photos uploaded" },
                            { done: form.campusMeetupSpots.length > 0,          label: "Meet-up spot selected" },
                          ].map(({ done, label }) => (
                            <div key={label} className={`flex items-center gap-2.5 ${done ? "text-ink" : "text-slate-400"}`}>
                              <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${done ? "bg-brand text-white" : "bg-elevated text-muted border border-border"}`}>
                                {done ? <Check size={10} /> : "-"}
                              </span>
                              {label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Footer Controls */}
          <div className="bg-elevated/80 backdrop-blur-xl border-t border-border p-5 sm:px-10 flex items-center justify-between">
            <button 
              type="button" 
              onClick={prevStep} 
              className={`btn-secondary px-6 py-2.5 flex items-center gap-2 ${currentStep === 1 ? "opacity-0 pointer-events-none" : ""}`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentStep < 4 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="btn-primary px-8 py-2.5 flex items-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={submit} 
                disabled={loading} 
                className="btn-primary btn-shimmer px-8 py-2.5 flex items-center gap-2 bg-gradient-to-r from-brand to-emerald-500 hover:from-brand hover:to-brand shadow-brand/25 shadow-lg"
              >
                {loading ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Publishing...</>
                ) : (
                  <><Sparkles size={16} /> Publish Listing</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SellPage;

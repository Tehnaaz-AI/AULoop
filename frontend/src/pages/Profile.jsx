import {
  BadgeCheck,
  Calendar,
  Camera,
  Check,
  Edit2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
  X,
  Instagram,
  Twitter,
  Linkedin,
  Globe
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ListingCard from "../components/ListingCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useUi } from "../context/UiContext.jsx";
import PageTransition from "../components/PageTransition.jsx";
import api from "../services/api";
import { formatPrice } from "../utils/constants.js";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setUser: setAuthUser } = useAuth();
  const { toast, notify } = useUi();
  const fileInputRef = useRef(null);

  const [user, setUserData] = useState(null);
  const [listings, setListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wished, setWished] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("selling");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    phone: "",
    department: "",
    year: "",
    socials: { instagram: "", twitter: "", linkedin: "", portfolio: "" }
  });

  const isOwnProfile = !id || id === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : user;

  const tabListings = useMemo(() => {
    if (activeTab === "selling") return listings.filter((listing) => listing.status !== "sold");
    if (activeTab === "sold") return listings.filter((listing) => listing.status === "sold");
    return purchases;
  }, [activeTab, listings, purchases]);

  const formatJoinDate = (date) => {
    if (!date) return "Recently";
    try {
      return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  useEffect(() => {
    if (!displayUser) return;
    setEditForm({
      name: displayUser.name || "",
      description: displayUser.description || "",
      phone: displayUser.phone || "",
      department: displayUser.department || "",
      year: displayUser.year || "",
      socials: {
        instagram: displayUser.socials?.instagram || "",
        twitter: displayUser.socials?.twitter || "",
        linkedin: displayUser.socials?.linkedin || "",
        portfolio: displayUser.socials?.portfolio || ""
      }
    });
  }, [displayUser]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = id || currentUser?._id;
      if (!userId) return;

      if (id && id !== currentUser?._id) {
        const { data } = await api.get(`/users/${id}`);
        setUserData(data);
      } else if (isOwnProfile) {
        const { data } = await api.get("/auth/me");
        setAuthUser(data.user || data);
      }

      const [listingsRes, purchasesRes, reviewsRes] = await Promise.allSettled([
        api.get(`/listings?sellerId=${userId}`),
        api.get(`/listings?buyerId=${userId}`),
        api.get(`/reviews/seller/${userId}`)
      ]);

      if (listingsRes.status === "fulfilled") {
        const arr = listingsRes.value.data.listings || listingsRes.value.data || [];
        setListings(arr);
        if (currentUser) {
          setWished(Object.fromEntries(arr.map((item) => [item._id, (item.wishlistBy || []).includes(currentUser._id)])));
        }
      }
      if (purchasesRes.status === "fulfilled") {
        setPurchases(purchasesRes.value.data.listings || purchasesRes.value.data || []);
      }
      if (reviewsRes.status === "fulfilled") {
        setReviews(reviewsRes.value.data || []);
      }
    } catch (err) {
      toast(err.response?.data?.message || "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, currentUser?._id]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be under 5 MB", "error");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    try {
      setUploadingAvatar(true);
      const body = new FormData();
      body.append("avatar", avatarFile);
      const { data } = await api.patch("/users/profile", body, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAuthUser(data.user || data);
      setAvatarPreview(null);
      setAvatarFile(null);
      toast("Profile photo updated!", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to upload photo", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarChange = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);
      const { data } = await api.patch("/users/profile", editForm);
      setAuthUser(data.user || data);
      setIsEditing(false);
      toast("Profile updated!", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const toggleWishlist = async (listing) => {
    try {
      const { data } = await api.post(`/listings/${listing._id}/wishlist`);
      setWished((old) => ({ ...old, [listing._id]: data.wished }));
      notify(data.wished ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch {
      toast("Login to save items", "error");
    }
  };

  const startEditing = () => {
    setEditForm({
      name: displayUser?.name || "",
      description: displayUser?.description || "",
      phone: displayUser?.phone || "",
      department: displayUser?.department || "",
      year: displayUser?.year || "",
      socials: {
        instagram: displayUser?.socials?.instagram || "",
        twitter: displayUser?.socials?.twitter || "",
        linkedin: displayUser?.socials?.linkedin || "",
        portfolio: displayUser?.socials?.portfolio || ""
      }
    });
    setIsEditing((value) => !value);
  };

  const avatarUrl = avatarPreview || displayUser?.avatar?.url;
  const initials = displayUser?.name?.slice(0, 2).toUpperCase() || "?";

  if (loading && !displayUser) {
    return (
      <PageTransition className="page-shell">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-72 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-xl bg-elevated" />)}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!displayUser) {
    return (
      <PageTransition className="page-shell">
        <div className="card p-16 text-center">
          <User size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="font-bold text-muted">User not found</p>
        </div>
      </PageTransition>
    );
  }

  const tabs = [
    { key: "selling", label: "Active Items", count: listings.filter((item) => item.status !== "sold").length, icon: TrendingUp },
    { key: "sold", label: "Completed Sales", count: listings.filter((item) => item.status === "sold").length, icon: ShieldCheck },
    { key: "bought", label: "Purchases", count: purchases.length, icon: Package, ownOnly: true },
    { key: "reviews", label: `Reviews (${reviews.length})`, count: reviews.length, icon: MessageSquare }
  ];

  return (
    <PageTransition className="page-shell">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="glass-3d overflow-hidden rounded-xl">
          <div className="profile-cover-3d relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10 z-0" />
            <div className="absolute left-6 top-6 z-10 hidden max-w-md text-[#fff] sm:block">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#fff]/60">Campus identity</p>
              <h1 className="mt-3 text-3xl font-black leading-tight">Trusted profile for local deals</h1>
              <p className="mt-3 text-sm leading-6 text-[#fff]/70">
                Ratings, campus details, and listings live together so buyers can decide faster.
              </p>
            </div>
            <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-xl border border-[#fff]/15 bg-[#fff]/15 px-3.5 py-1.5 text-xs font-semibold text-[#fff] backdrop-blur-md">
              <Calendar size={13} />
              <span>Joined {formatJoinDate(displayUser.createdAt)}</span>
            </div>
          </div>

          <div className="relative z-10 px-4 pb-7 sm:px-8">
            <div className="glass-3d -mt-24 mb-6 grid gap-6 rounded-xl p-4 sm:p-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-end">
              <div className="flex justify-center lg:block">
                <div className="avatar-wrapper relative shrink-0">
                  <div className="avatar-3d flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 border-card bg-elevated sm:h-36 sm:w-36">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayUser.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-ink">{initials}</span>
                    )}
                  </div>
                  {isOwnProfile && !avatarPreview && (
                    <>
                      <button
                        type="button"
                        className="avatar-upload-overlay rounded-[1.25rem]"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change photo"
                      >
                        <Camera size={26} className="text-white" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </>
                  )}
                </div>
              </div>

              <div className="min-w-0 space-y-3 text-center lg:text-left">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                  <h2 className="min-w-0 break-words text-2xl font-black leading-tight text-ink sm:text-4xl">{displayUser.name}</h2>
                  <span className="badge badge-brand mx-auto w-fit shrink-0 text-[10px] sm:mx-0">
                    <ShieldCheck size={11} /> {displayUser.role === "admin" ? "Staff Admin" : "Verified Student"}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-x-4 gap-y-1 text-sm font-semibold text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
                  <span className="flex min-w-0 items-center justify-center gap-1.5 lg:justify-start">
                    <Mail size={14} className="shrink-0 text-muted" />
                    <span className="truncate">{displayUser.email}</span>
                  </span>
                  {displayUser.phone && (
                    <span className="flex items-center justify-center gap-1.5 lg:justify-start">
                      <Phone size={14} className="shrink-0 text-muted" />
                      {displayUser.phone}
                    </span>
                  )}
                </div>
                {displayUser.department && (
                  <p className="flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-brand lg:justify-start">
                    <MapPin size={12} /> {displayUser.department}{displayUser.year ? ` - Year ${displayUser.year}` : ""}
                  </p>
                )}
              </div>

              {isOwnProfile && (
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
                  {avatarPreview ? (
                    <>
                      <button onClick={handleAvatarUpload} disabled={uploadingAvatar} className="btn-primary px-4 py-2 text-xs">
                        {uploadingAvatar ? (
                          <span className="flex items-center gap-2">
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          <><Check size={14} /> Save photo</>
                        )}
                      </button>
                      <button onClick={cancelAvatarChange} className="btn-secondary px-4 py-2 text-xs"><X size={14} /> Cancel</button>
                    </>
                  ) : (
                    <button onClick={startEditing} className="btn-secondary px-4 py-2 text-xs shadow-soft">
                      <Edit2 size={13} /> {isEditing ? "Close Edit" : "Edit Profile"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mb-6 rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-soft animate-[slideDown_0.2s_ease-out]">
                <p className="mb-3.5 text-xs font-black uppercase tracking-widest text-brand">Update Information</p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input py-2 text-sm" value={editForm.name} onChange={(event) => setEditForm((old) => ({ ...old, name: event.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="label">Phone Number</label>
                      <input className="input py-2 text-sm" value={editForm.phone} onChange={(event) => setEditForm((old) => ({ ...old, phone: event.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Year</label>
                      <input className="input py-2 text-sm" value={editForm.year} onChange={(event) => setEditForm((old) => ({ ...old, year: event.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Department</label>
                      <input className="input py-2 text-sm" value={editForm.department} onChange={(event) => setEditForm((old) => ({ ...old, department: event.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">About You</label>
                    <textarea
                      value={editForm.description}
                      onChange={(event) => setEditForm((old) => ({ ...old, description: event.target.value }))}
                      maxLength={300}
                      className="input resize-none py-2 text-sm"
                      rows={3}
                    />
                    <div className="mt-1 flex justify-between text-[10px] font-bold text-muted">
                      <span>{(editForm.description || "").length}/300 chars</span>
                      <span>{300 - (editForm.description || "").length} characters left</span>
                    </div>
                  </div>
                  <div>
                    <label className="label">Social Links</label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-1">
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all">
                        <Instagram size={14} className="text-muted" />
                        <input placeholder="Instagram URL or username" className="flex-1 bg-transparent py-2 text-sm outline-none text-ink placeholder:text-muted/60" value={editForm.socials.instagram} onChange={(e) => setEditForm(old => ({...old, socials: {...old.socials, instagram: e.target.value}}))} />
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all">
                        <Twitter size={14} className="text-muted" />
                        <input placeholder="Twitter URL or username" className="flex-1 bg-transparent py-2 text-sm outline-none text-ink placeholder:text-muted/60" value={editForm.socials.twitter} onChange={(e) => setEditForm(old => ({...old, socials: {...old.socials, twitter: e.target.value}}))} />
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all">
                        <Linkedin size={14} className="text-muted" />
                        <input placeholder="LinkedIn URL" className="flex-1 bg-transparent py-2 text-sm outline-none text-ink placeholder:text-muted/60" value={editForm.socials.linkedin} onChange={(e) => setEditForm(old => ({...old, socials: {...old.socials, linkedin: e.target.value}}))} />
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 transition-all">
                        <Globe size={14} className="text-muted" />
                        <input placeholder="Portfolio / Website URL" className="flex-1 bg-transparent py-2 text-sm outline-none text-ink placeholder:text-muted/60" value={editForm.socials.portfolio} onChange={(e) => setEditForm(old => ({...old, socials: {...old.socials, portfolio: e.target.value}}))} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setIsEditing(false)} className="btn-secondary px-4 py-2 text-xs">Cancel</button>
                  <button onClick={handleUpdateProfile} disabled={updatingProfile} className="btn-primary btn-shimmer px-4 py-2 text-xs">
                    {updatingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : displayUser.description ? (
              <div className="mb-6 rounded-xl border border-border bg-white/75 p-4">
                <p className="mb-1 text-xs font-black uppercase tracking-wider text-muted">Bio</p>
                <p className="text-sm font-medium leading-relaxed text-muted">{displayUser.description}</p>
              </div>
            ) : isOwnProfile ? (
              <div className="mb-6 rounded-xl border border-dashed border-border bg-white/60 p-4 text-center">
                <p className="text-xs font-semibold italic text-muted">Add a bio to introduce yourself and what you usually sell.</p>
              </div>
            ) : null}

            {/* Social Links Rendering */}
            {!isEditing && displayUser.socials && Object.values(displayUser.socials).some(Boolean) && (
              <div className="mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {displayUser.socials.instagram && (
                  <a href={displayUser.socials.instagram.startsWith('http') ? displayUser.socials.instagram : `https://instagram.com/${displayUser.socials.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50/50 px-3 py-1.5 text-xs font-bold text-pink-600 hover:bg-pink-100 transition-all">
                    <Instagram size={13} /> Instagram
                  </a>
                )}
                {displayUser.socials.twitter && (
                  <a href={displayUser.socials.twitter.startsWith('http') ? displayUser.socials.twitter : `https://twitter.com/${displayUser.socials.twitter.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/50 px-3 py-1.5 text-xs font-bold text-sky-600 hover:bg-sky-100 transition-all">
                    <Twitter size={13} /> Twitter
                  </a>
                )}
                {displayUser.socials.linkedin && (
                  <a href={displayUser.socials.linkedin.startsWith('http') ? displayUser.socials.linkedin : `https://linkedin.com/in/${displayUser.socials.linkedin.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all">
                    <Linkedin size={13} /> LinkedIn
                  </a>
                )}
                {displayUser.socials.portfolio && (
                  <a href={displayUser.socials.portfolio.startsWith('http') ? displayUser.socials.portfolio : `https://${displayUser.socials.portfolio}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all">
                    <Globe size={13} /> Portfolio
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: ShieldCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20", value: displayUser.trustScore || 0, label: "Trust Score", unit: "%" },
                { icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20", value: listings.filter((item) => item.status === "sold").length, label: "Items Sold" },
                { icon: Package, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20", value: purchases.length, label: "Purchases" },
                { icon: Star, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20", value: displayUser.reviewCount || 0, subValue: displayUser.reviewAverage ? displayUser.reviewAverage.toFixed(1) : null, label: "Seller Ratings" }
              ].map(({ icon: Icon, color, bg, value, subValue, label, unit }) => (
                <div key={label} className={`lift-3d rounded-xl ${bg} border p-5 text-center`}>
                  <div className="mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-soft">
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-2xl font-black leading-tight text-ink">
                    {value}{unit || ""}{subValue ? <span className="ml-1 text-sm text-muted">({subValue} stars)</span> : null}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
                </div>
              ))}
            </div>

            {(displayUser.badges || []).length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-muted">Earned Badges</p>
                <div className="flex flex-wrap gap-2">
                  {displayUser.badges.map((badge) => (
                    <span key={badge} className="badge badge-brand border border-brand/20 px-3 py-1.5 text-xs shadow-sm">
                      <BadgeCheck size={13} /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="glass-3d overflow-hidden rounded-xl">
          <div className="flex overflow-x-auto border-b border-slate-100 bg-white/50 hide-scrollbar">
            {tabs.map(({ key, label, count, icon: Icon, ownOnly }) => {
              if (ownOnly && !isOwnProfile) return null;
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex shrink-0 items-center justify-center gap-2 border-b-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                    active ? "border-brand bg-card text-brand" : "border-transparent text-muted hover:bg-slate-100/50 hover:text-slate-600"
                  }`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? "bg-brand text-white" : "bg-slate-200 text-muted"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white/80 p-6">
            {activeTab === "reviews" ? (
              <div className="overflow-y-scroll max-h-[440px] pr-1.5">
                {reviews.length === 0 ? (
                  <div className="mx-auto max-w-md py-12 text-center">
                    <Star size={36} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-muted">No feedback yet</p>
                    <p className="mt-1 text-xs text-muted">Student reviews will appear here once campus listings are bought or sold.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {reviews.map((review) => (
                      <div key={review._id} className="lift-3d flex flex-col justify-between rounded-xl border border-border bg-slate-50/70 p-5">
                        <div>
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-extrabold text-ink">{review.buyer?.name || "Verified Student"}</p>
                              <p className="mt-0.5 text-[10px] font-semibold text-muted">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border border-amber-200/50 bg-amber-50 px-2 py-0.5">
                              <Star size={11} className="fill-amber-400 text-amber-400" />
                              <span className="text-xs font-black text-amber-700">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs font-semibold italic leading-relaxed text-muted">"{review.comment || "No comment left"}"</p>
                        </div>
                        {review.listing && (
                          <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3 text-[10px] font-bold text-muted">
                            <span className="min-w-0 truncate">Item: <span className="text-muted">{review.listing.title}</span></span>
                            <span className="shrink-0 text-muted">{formatPrice(review.listing.price)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-y-scroll max-h-[440px] pr-1.5">
                {tabListings.length === 0 ? (
                  <div className="mx-auto max-w-sm py-16 text-center">
                    <Package size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-bold text-muted">{activeTab === "selling" ? "No active listings" : activeTab === "sold" ? "No items sold yet" : "No purchases yet"}</p>
                    <p className="mb-5 mt-1 text-xs leading-relaxed text-muted">
                      {activeTab === "selling" ? "Start publishing items you no longer need inside Anurag University." : activeTab === "sold" ? "Items you mark as sold in the dashboard will appear here." : "Campus resale purchases will be saved here."}
                    </p>
                    {activeTab === "selling" && isOwnProfile && <Link to="/sell" className="btn-primary px-5 py-2 text-xs">List an item</Link>}
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tabListings.map((item) => (
                      <ListingCard key={item._id} listing={item} onWishlist={toggleWishlist} wished={wished[item._id]} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {listings.length === 0 && purchases.length === 0 && !loading && (
          <div className="glass-3d mx-auto max-w-md rounded-xl p-12 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <Package size={26} />
            </div>
            <h3 className="mb-1 text-lg font-black text-ink">No campus resale activity</h3>
            <p className="mx-auto mb-5 max-w-xs text-xs leading-relaxed text-muted">Start browsing student deals on campus or create a post to sell yours.</p>
            {isOwnProfile && <Link to="/sell" className="btn-primary btn-shimmer px-6 py-2 text-xs">Sell an item</Link>}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

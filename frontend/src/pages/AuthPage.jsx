import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, MailCheck, ShieldCheck, Upload } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, verify } = useAuth();
  const { toast } = useUi();
  const [mode, setMode] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", department: "", year: "", otp: "" });

  const update = (e) => setForm(old => ({ ...old, [e.target.name]: e.target.value }));

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
        if (profileImage) formData.append("avatar", profileImage);
        await api.post("/auth/register", formData, { headers: { "Content-Type": "multipart/form-data" } });
        setPendingEmail(form.email);
        setMode("verify");
        toast("OTP sent to your college email", "success");
      } else if (mode === "verify") {
        await verify({ email: pendingEmail || form.email, otp: form.otp });
        toast("Email verified. Welcome to AULoop!", "success");
        navigate("/");
      } else {
        await login({ email: form.email, password: form.password });
        toast("Login successful", "success");
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      if (err.response?.status === 403 && msg.toLowerCase().includes("verify")) {
        setPendingEmail(form.email);
        setMode("verify");
      }
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/resend-otp", { email: pendingEmail || form.email });
      toast(data.message, "success");
    } catch (err) {
      toast(err.response?.data?.message || "Could not resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition-all outline-none focus:border-brand focus:bg-white focus:shadow-glow";

  return (
    <div className="grid min-h-[calc(100vh-8rem)] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">

      {/* ── Left: Hero ── */}
      <section className="space-y-6 py-8">
        <span className="inline-flex items-center gap-2 rounded-xl bg-brand/10 px-3 py-2 text-sm font-bold text-brand">
          <ShieldCheck size={16} /> anurag.edu.in verified marketplace
        </span>
        <h1 className="max-w-xl text-4xl font-black leading-tight text-ink md:text-5xl">
          Buy less new.<br />Sell smarter.<br />
          <span className="text-brand">Keep the loop moving.</span>
        </h1>
        <p className="max-w-lg text-base text-muted leading-relaxed">
          AULoop is a closed resale network for Anurag University students — OTP-secured, real-time chat, seller reviews, and admin moderation.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, label: "OTP secured", desc: "College email only" },
            { icon: MailCheck,   label: "Live offers",  desc: "Negotiate in chat" },
            { icon: BadgeCheck,  label: "Moderated",    desc: "Admin reviewed" }
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <Icon size={18} className="text-brand mb-2" />
              <p className="text-sm font-black text-ink">{label}</p>
              <p className="text-xs text-muted mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Right: Form ── */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-xl bg-elevated p-1 gap-1">
          {["login", "register", "verify"].map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold capitalize transition-all ${
                mode === item ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {mode === "register" && (
            <>
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-3 pb-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-hero flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                    {profilePreview
                      ? <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                      : <Upload className="text-white" size={24} />
                    }
                  </div>
                  <label htmlFor="avatar" className="absolute -bottom-1 -right-1 bg-brand rounded-full p-1.5 cursor-pointer hover:bg-indigo-600 transition shadow-md">
                    <Upload size={13} className="text-white" />
                  </label>
                  <input id="avatar" type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                </div>
                <p className="text-xs text-muted">Profile photo (optional)</p>
              </div>

              <input name="name" value={form.name} onChange={update} placeholder="Full name" className={inputCls} required />
              <input name="phone" value={form.phone} onChange={update} placeholder="Phone number" className={inputCls} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name="department" value={form.department} onChange={update} placeholder="Department" className={inputCls} />
                <input name="year" value={form.year} onChange={update} placeholder="Year (e.g. 2)" className={inputCls} />
              </div>
            </>
          )}

          <input name="email" value={form.email} onChange={update} placeholder="name@anurag.edu.in" type="email" className={inputCls} required />

          {mode !== "verify" ? (
            <input name="password" value={form.password} onChange={update} placeholder="Password" type="password" className={inputCls} required />
          ) : (
            <>
              <input name="otp" value={form.otp} onChange={update} placeholder="6-digit OTP from your email" className={inputCls} required />
              <button type="button" onClick={resendOtp} disabled={loading} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted hover:bg-slate-50 hover:text-ink transition-all">
                Resend OTP
              </button>
            </>
          )}

          <button
            disabled={loading}
            className="w-full btn-primary py-3 text-base btn-shimmer"
          >
            {loading
              ? <span className="flex items-center gap-2 justify-center"><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Please wait…</span>
              : <><MailCheck size={17} /> {mode === "register" ? "Send OTP" : mode === "verify" ? "Verify Email" : "Login"}</>
            }
          </button>
        </form>
      </section>
    </div>
  );
};

export default AuthPage;

import { useEffect, useState, useMemo } from "react";
import { BellRing, CheckCircle2, MessageCircle, Sparkles, Star, Check, Trash2, ShieldCheck, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition.jsx";
import { useUi } from "../context/UiContext.jsx";
import api from "../services/api";

const icons = { 
  message: MessageCircle, 
  chat: MessageCircle, 
  badge: Sparkles, 
  sale: CheckCircle2, 
  purchase: CheckCircle2, 
  default: BellRing 
};

const colors = { 
  message: "bg-brand text-white", 
  chat: "bg-brand text-white", 
  badge: "bg-accent text-white", 
  sale: "bg-emerald-500 text-white", 
  purchase: "bg-brand text-white", 
  default: "bg-slate-800 text-white" 
};

const lightColors = {
  message: "bg-brand/10",
  chat: "bg-brand/10",
  badge: "bg-accent/10",
  sale: "bg-emerald-500/10",
  purchase: "bg-brand/10",
  default: "bg-slate-100"
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, setNotifications, setNewNotifications, toast } = useUi();
  const [activeTab, setActiveTab] = useState("all");
  const [reviewingId, setReviewingId] = useState(null);
  const [reportingId, setReportingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reportForm, setReportForm] = useState({ reason: "Scam", details: "" });
  const [submitting, setSubmitting] = useState(false);

  // Clear global badge on mount, but do NOT aggressively mark all as read in DB.
  useEffect(() => {
    setNewNotifications(false);
  }, [setNewNotifications]);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isNew: false })));
      toast("All marked as read", "success");
    } catch {
      toast("Failed to mark as read", "error");
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
      toast("All notifications cleared", "success");
    } catch {
      toast("Failed to clear notifications", "error");
    }
  };

  const handleNotificationClick = async (item) => {
    if (item.isNew || !item.read) {
      try {
        await api.patch(`/notifications/${item._id}/read`);
        setNotifications((prev) => prev.map((n) => (n._id === item._id ? { ...n, isNew: false, read: true } : n)));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    if (item.type === "chat" || item.type === "message") {
      navigate(item.chat ? `/chats/${item.chat}` : "/chats");
    } else if (item.type === "sale" || item.type === "purchase") {
      navigate("/dashboard");
    }
  };

  const handleReviewSubmit = async (item, e) => {
    e.stopPropagation();
    if (!item.listing?._id) return;
    setSubmitting(true);
    try {
      const rating = typeof reviewForm.rating === "number" ? reviewForm.rating : 5;
      await api.post(`/reviews/listings/${item.listing._id}`, { rating, comment: reviewForm.comment || "" });
      setNotifications((prev) => prev.map((n) => n._id === item._id ? { ...n, listing: { ...n.listing, reviewedByBuyer: true } } : n));
      setReviewingId(null);
      toast("Review submitted successfully!", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async (item, e) => {
    e.stopPropagation();
    if (!item.listing?._id) return;
    setSubmitting(true);
    try {
      await api.post("/reports", {
        listing: item.listing._id,
        reportedUser: item.listing.seller?._id || item.listing.seller || null,
        reason: reportForm.reason,
        details: reportForm.details
      });
      setReportingId(null);
      toast("Report submitted successfully!", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to submit report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "transactions") return n.type === "sale" || n.type === "purchase";
    return true;
  }), [notifications, activeTab]);

  return (
    <PageTransition className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-ink tracking-tight">Updates</h1>
            <p className="text-muted font-medium mt-1">Everything you need to know, in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="btn-secondary py-2 text-xs flex items-center gap-1.5 font-bold shadow-sm bg-white/60 hover:bg-white border-white/80">
              <Check size={14} className="text-brand" /> Mark all read
            </button>
            <button onClick={clearAll} className="btn-secondary py-2 text-xs flex items-center gap-1.5 font-bold shadow-sm bg-coral/5 hover:bg-coral/10 text-coral border-coral/20">
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 overflow-x-auto hide-scrollbar pb-2">
          {["all", "unread", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab ? "text-white shadow-md" : "text-muted hover:bg-card hover:text-ink border border-border"
              }`}
            >
              {activeTab === tab && (
                <motion.div layoutId="notif-tab" className="absolute inset-0 bg-brand rounded-full -z-10 shadow-brand/30 shadow-lg" />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center rounded-[2rem] border-2 border-dashed border-border bg-card/30 backdrop-blur-sm"
            >
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand/10 to-accent/5 flex items-center justify-center mb-6 shadow-inner">
                <BellRing className="text-brand/50" size={36} />
              </div>
              <p className="text-xl font-black text-ink mb-2">You're all caught up!</p>
              <p className="text-sm font-semibold text-muted max-w-[250px]">No {activeTab !== "all" ? activeTab : "new"} notifications to show right now.</p>
            </motion.div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = icons[item.type] || icons.default;
              const colorCls = colors[item.type] || colors.default;
              const lightCls = lightColors[item.type] || lightColors.default;
              const isUnread = !item.read || item.isNew;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative overflow-hidden flex flex-col rounded-2xl p-5 cursor-pointer transition-all duration-300 border backdrop-blur-xl ${
                    isUnread 
                      ? "bg-white border-brand/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(var(--color-brand-rgb),0.1)] hover:-translate-y-0.5" 
                      : "bg-white/60 border-white hover:bg-white hover:shadow-card"
                  }`}
                >
                  <div className="flex items-start gap-4 z-10">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${lightCls}`}>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorCls} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className={`text-base font-bold truncate ${isUnread ? "text-ink" : "text-ink/80"}`}>{item.title || item.message}</p>
                        {isUnread && <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_var(--color-brand)] flex-shrink-0" />}
                      </div>
                      <p className={`text-sm mt-1 leading-relaxed ${isUnread ? "text-muted font-medium" : "text-muted/80"}`}>{item.body || item.time}</p>
                      
                      {item.createdAt && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inline Actions */}
                  {item.type === "purchase" && item.listing && (
                    <div className="mt-4 pt-4 border-t border-slate-100 z-10" onClick={(e) => e.stopPropagation()}>
                      {!item.listing.reviewedByBuyer ? (
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setReviewingId(reviewingId === item._id ? null : item._id); setReportingId(null); }} className="btn-primary py-2 px-4 text-xs font-bold rounded-xl shadow-sm hover:scale-105 transition-transform flex items-center gap-1.5"><ShieldCheck size={14}/> Rate Seller</button>
                          <button onClick={(e) => { e.stopPropagation(); setReportingId(reportingId === item._id ? null : item._id); setReviewingId(null); }} className="btn-secondary py-2 px-4 text-xs font-bold rounded-xl border border-coral/20 text-coral bg-coral/5 hover:bg-coral hover:text-white transition-all flex items-center gap-1.5"><Flag size={14}/> Report</button>
                        </div>
                      ) : (
                        <p className="text-xs font-black text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={16} /> Seller rated & reviewed</p>
                      )}

                      {/* Rating Panel */}
                      <AnimatePresence>
                        {reviewingId === item._id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                            <div className="p-4 rounded-xl bg-slate-50 border border-border shadow-inner space-y-3">
                              <p className="text-xs font-black text-ink uppercase tracking-widest">Rate your experience</p>
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} type="button" onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))} className="text-amber-400 hover:scale-110 transition-transform">
                                    <Star size={24} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                                  </button>
                                ))}
                              </div>
                              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="Write a short review..." className="input text-sm w-full py-2 h-20 resize-none bg-white shadow-sm" />
                              <div className="flex gap-2">
                                <button disabled={submitting} onClick={(e) => handleReviewSubmit(item, e)} className="btn-primary py-2 px-5 text-xs flex-1">{submitting ? "Submitting..." : "Submit Review"}</button>
                                <button onClick={() => setReviewingId(null)} className="btn-secondary py-2 px-5 text-xs bg-white">Cancel</button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Report Panel */}
                        {reportingId === item._id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                            <div className="p-4 rounded-xl bg-coral/5 border border-coral/20 shadow-inner space-y-3">
                              <p className="text-xs font-black text-coral uppercase tracking-widest">Report Transaction</p>
                              <select value={reportForm.reason} onChange={(e) => setReportForm(prev => ({ ...prev, reason: e.target.value }))} className="input text-sm w-full bg-white shadow-sm">
                                {["Scam", "Spam", "Wrong Category", "Abusive Chat", "Sold Outside App", "Other"].map((r) => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <textarea value={reportForm.details} onChange={(e) => setReportForm(prev => ({ ...prev, details: e.target.value }))} placeholder="Provide details..." className="input text-sm w-full py-2 h-20 resize-none bg-white shadow-sm" />
                              <div className="flex gap-2">
                                <button disabled={submitting} onClick={(e) => handleReportSubmit(item, e)} className="btn-primary bg-coral hover:bg-rose-600 border-coral py-2 px-5 text-xs flex-1 text-white">{submitting ? "Submitting..." : "Submit Report"}</button>
                                <button onClick={() => setReportingId(null)} className="btn-secondary py-2 px-5 text-xs bg-white text-ink border-border hover:bg-slate-50">Cancel</button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
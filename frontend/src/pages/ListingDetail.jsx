import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, BadgeCheck, ChevronLeft, ChevronRight,
  ChevronRight as ChevronRightIcon, Flag, Heart, MapPin, MessageCircle,
  Phone, Share2, ShieldCheck, Sparkles, Star, X
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { formatPrice } from "../utils/constants";
import { meetupLabel } from "../utils/product.js";
import { Helmet } from "react-helmet-async";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify, toast } = useUi();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [wished, setWished] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: "Scam", details: "" });
  const [reportSent, setReportSent] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    api.get(`/listings/${id}`)
      .then(({ data }) => { setListing(data); setWished(data.wishlistBy?.includes?.(user?._id) || false); })
      .catch(() => toast("Listing not found", "error"))
      .finally(() => setLoading(false));
  }, [id, toast, user?._id]);

  const startChat = async () => {
    if (!user) { navigate("/auth"); return; }
    try {
      setChatLoading(true);
      const { data } = await api.post("/chats", { listingId: id });
      notify("Chat started successfully!", "success");
      navigate(`/chats/${data._id}`);
    } catch (err) {
      toast(err.response?.data?.message || "Could not start chat", "error");
    } finally { setChatLoading(false); }
  };

  const toggleWishlist = async () => {
    if (!user) { navigate("/auth"); return; }
    try {
      const { data } = await api.post(`/listings/${id}/wishlist`);
      setWished(data.wished);
      notify(data.wished ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch { toast("Login to save items", "error"); }
  };

  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: listing?.title, url: window.location.href }); }
    else { navigator.clipboard.writeText(window.location.href); toast("Link copied!", "success"); }
  };

  const report = async () => {
    try {
      await api.post("/reports", { listing: id, reportedUser: listing.seller._id, ...reportForm });
      setReportSent(true);
      notify("Report sent to admins", "success");
      setTimeout(() => setShowReport(false), 1500);
    } catch (err) {
      toast(err.response?.data?.message || "Could not send report", "error");
    }
  };

  const rateSeller = async () => {
    try {
      await api.post(`/reviews/listings/${id}`, ratingForm);
      setListing(old => ({ ...old, reviewedByBuyer: true }));
      notify("Seller rated successfully", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to submit rating", "error");
    }
  };

  const images = listing?.images?.length ? listing.images : [];
  const isOwner = user?._id === listing?.seller?._id;
  const pickupSpot = listing ? meetupLabel(listing) : "";

  /* Loading */
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-5xl mx-auto">
        <div className="h-7 w-24 bg-slate-200 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="aspect-[4/3] rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
            <div className="h-10 bg-elevated rounded-lg w-1/2" />
            <div className="h-24 bg-elevated rounded-xl" />
            <div className="h-12 bg-elevated rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="card p-16 text-center max-w-md mx-auto">
        <AlertTriangle size={40} className="mx-auto text-coral/60 mb-3" />
        <p className="font-bold text-muted">Listing not found</p>
        <Link to="/" className="btn-primary mt-4 text-sm">Browse listings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <Helmet>
        <title>{listing.title} - AULoop</title>
        <meta property="og:title" content={`${listing.title} - ₹${listing.price}`} />
        <meta property="og:description" content={listing.description || "Check out this listing on AULoop Campus Marketplace"} />
        {images.length > 0 && <meta property="og:image" content={images[0]?.url} />}
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">

        {/* Left: Images */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-elevated border border-border shadow-card group">
            {images.length > 0 ? (
              <img src={images[activeImg]?.url} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            ) : (
              <div className="grid h-full place-items-center text-slate-300">
                <div className="text-center"><Sparkles size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm font-semibold">No image</p></div>
              </div>
            )}

            {listing.status === "sold" && (
              <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
                <span className="bg-coral text-white font-black text-lg px-6 py-2 rounded-full -rotate-6 shadow-lg">SOLD</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-ink hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-ink hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`h-1.5 rounded-full transition-all ${i === activeImg ? "w-5 bg-card" : "w-1.5 bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-scroll pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-brand shadow-glow" : "border-border hover:border-slate-300"}`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="card p-5">
            <h2 className="label mb-3">Description</h2>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {listing.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Title & price */}
          <div className="card p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge badge-brand">{listing.category}</span>
              <span className="badge badge-sun">{listing.condition}</span>
              {listing.status !== "available" && (
                <span className="badge badge-coral">{listing.status}</span>
              )}
            </div>
            <h1 className="text-2xl font-black text-ink leading-tight mb-2">{listing.title}</h1>
            {listing.category === "Campus Radar" ? (
              <p className={`text-3xl font-black capitalize ${listing.lostFoundType === 'lost' ? 'text-coral' : 'text-blue-600'}`}>
                {listing.lostFoundType} Item
              </p>
            ) : (
              <p className="text-3xl font-black text-brand">{formatPrice(listing.price)}</p>
            )}

            {listing.qualityScore != null && (
              <div className="flex items-center gap-2 mt-3 text-xs text-muted">
                <Sparkles size={12} className="text-amber-400" />
                <span className="font-semibold">Listing quality</span>
                <div className="flex-1 h-1.5 rounded-full bg-elevated overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all" style={{ width: `${listing.qualityScore}%` }} />
                </div>
                <span className="font-bold text-brand">{listing.qualityScore}%</span>
              </div>
            )}
          </div>

          {/* Seller */}
          <div className="card p-5">
            <p className="label">Seller</p>
            <Link to={`/users/${listing.seller?._id}`} className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-full bg-hero flex items-center justify-center text-white font-black text-sm flex-shrink-0 overflow-hidden">
                {listing.seller?.avatar?.url
                  ? <img src={listing.seller.avatar.url} alt="" className="h-full w-full object-cover" />
                  : listing.seller?.name?.slice(0, 2).toUpperCase() || "?"
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-ink group-hover:text-brand transition-colors truncate">{listing.seller?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck size={11} className="text-brand" />
                  <span className="text-xs text-muted font-semibold">
                    {(listing.seller?.completedSales === 0 || !listing.seller?.completedSales) && (listing.seller?.reviewCount === 0 || !listing.seller?.reviewCount) 
                      ? "New Seller" 
                      : `Trust ${listing.seller?.trustScore || 0}`}
                  </span>
                  {listing.seller?.reviewCount > 0 && (
                    <><span className="text-slate-200">-</span><Star size={10} className="text-amber-400" /><span className="text-xs text-muted font-semibold">{listing.seller.reviewAverage?.toFixed(1) || "N/A"} ({listing.seller.reviewCount})</span></>
                  )}
                </div>
              </div>
              <ChevronRightIcon size={15} className="text-slate-300 group-hover:text-brand transition-colors" />
            </Link>
            {listing.seller?.phone && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-sm text-muted">
                <Phone size={13} className="text-muted" />
                <span className="font-semibold">{listing.seller.phone}</span>
              </div>
            )}
          </div>

          {/* Safe Zones */}
          {listing.campusMeetupSpots?.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3 mt-6">
              <p className="label text-emerald-700 flex items-center gap-1.5 font-bold"><ShieldCheck size={16} /> Verified Safe Campus Zones</p>
              <div className="flex flex-wrap gap-2">
                {listing.campusMeetupSpots.map(spot => (
                  <span key={spot} className="badge bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold shadow-sm">
                    {spot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {pickupSpot && (
            <div className="card p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-brand" />
              </div>
              <div>
                <p className="label mb-0">Pickup spot</p>
                <p className="text-sm font-bold text-ink">{pickupSpot}</p>
              </div>
            </div>
          )}

          {/* Buyer info */}
          {listing.status === "sold" && listing.soldTo && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-4">
              <div>
                <p className="label text-emerald-600">Purchased by</p>
                <Link to={`/users/${listing.soldTo?._id}`} className="flex items-center gap-2 group">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">
                    {listing.soldTo?.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-ink group-hover:text-emerald-600 transition-colors text-sm">{listing.soldTo?.name}</span>
                </Link>
              </div>

              {listing.soldTo?._id === user?._id && (
                <div className="pt-3 border-t border-emerald-200">
                  <p className="text-sm font-bold text-ink mb-2">Review your purchase</p>
                  {!listing.reviewedByBuyer ? (
                    <div className="space-y-2">
                      <select
                        value={ratingForm.rating}
                        onChange={(e) => setRatingForm(o => ({ ...o, rating: Number(e.target.value) }))}
                        className="input text-sm py-2 bg-white"
                      >
                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} stars</option>)}
                      </select>
                      <input
                        value={ratingForm.comment}
                        onChange={(e) => setRatingForm(o => ({ ...o, comment: e.target.value }))}
                        placeholder="Leave a review for the seller…"
                        className="input text-sm py-2 bg-white"
                      />
                      <button onClick={rateSeller} className="btn-primary w-full text-sm py-2">
                        Submit Review
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <BadgeCheck size={14} /> You have reviewed this seller
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-2.5">
            {!isOwner ? (
              <button
                onClick={startChat}
                disabled={chatLoading || listing.status === "sold"}
                className="w-full btn-primary py-3 text-base btn-shimmer"
              >
                {chatLoading
                  ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Opening chat...</span>
                  : <><MessageCircle size={18} /> {listing.status === "sold" ? "Already sold" : (listing.category === "Campus Radar" || listing.category === "Lost & Found") ? "Chat" : "Chat to Buy"}</>
                }
              </button>
            ) : (
              <Link to="/dashboard" className="w-full btn-secondary py-3 text-base flex items-center justify-center">
                Manage in Dashboard
              </Link>
            )}

            <div className="flex gap-2">
              <button
                onClick={toggleWishlist}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  wished ? "bg-coral/10 border-coral/30 text-coral" : "border-border text-muted hover:border-coral/30 hover:text-coral hover:bg-coral/5"
                }`}
              >
                <Heart size={15} fill={wished ? "currentColor" : "none"} />
                {wished ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-bold text-muted hover:border-slate-300 hover:text-ink transition-all"
              >
                <Share2 size={15} /> Share
              </button>
            </div>
          </div>

          {/* Safety note */}
          <div className="rounded-xl bg-brand/5 border border-brand/15 p-4 flex gap-3">
            <BadgeCheck size={17} className="text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-ink mb-0.5">Campus verified</p>
              <p className="text-xs text-muted leading-relaxed">Only Anurag University students can list here. Always meet at campus spots.</p>
            </div>
          </div>

          {/* Report */}
          {!isOwner && (
            <div>
              {!showReport ? (
                <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 text-xs text-muted hover:text-coral transition-colors font-semibold">
                  <Flag size={12} /> Report this listing
                </button>
              ) : (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-coral">Report listing</p>
                    <button onClick={() => setShowReport(false)} className="text-muted hover:text-ink transition-colors"><X size={13} /></button>
                  </div>
                  {reportSent ? (
                    <p className="text-xs font-bold text-brand text-center py-2">Report sent. Thank you.</p>
                  ) : (
                    <>
                      <select value={reportForm.reason} onChange={(e) => setReportForm(o => ({ ...o, reason: e.target.value }))} className="input text-xs py-2">
                        {["Scam","Spam","Wrong Category","Abusive Chat","Sold Outside App","Other"].map(r => <option key={r}>{r}</option>)}
                      </select>
                      <textarea value={reportForm.details} onChange={(e) => setReportForm(o => ({ ...o, details: e.target.value }))} placeholder="Additional details..." className="input text-xs py-2 resize-none" rows={2} />
                      <button onClick={report} className="w-full btn-danger py-2 text-xs flex items-center justify-center gap-1.5">
                        <Flag size={12} /> Submit report
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;

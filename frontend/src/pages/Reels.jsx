import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Send, Share2, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useApiResource } from "../hooks/useApiResource.js";
import { useUi } from "../context/UiContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PageTransition from "../components/PageTransition.jsx";
import { meetupLabel, priceLabel, productVideo, sellerBadge, sellerTrust } from "../utils/product.js";

function ReelVideo({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      className="h-full w-full object-cover opacity-90"
    />
  );
}

export default function Reels() {
  const navigate = useNavigate();
  const { notify, toast } = useUi();
  const { user } = useAuth();
  const { data, loading } = useApiResource(async () => (await api.get("/listings")).data, []);
  const listings = (data?.listings ?? []).filter(listing => productVideo(listing));
  
  const [wished, setWished] = useState({});
  const [activeShare, setActiveShare] = useState(null);

  useEffect(() => {
    if (listings.length && user?._id) {
      const initialWished = {};
      listings.forEach(listing => {
        initialWished[listing._id] = (listing.wishlistBy || []).includes(user._id);
      });
      setWished(initialWished);
    }
  }, [data, user]);

  const handleWishlist = async (listing) => {
    if (!user) return toast("Login to wishlist items", "error");
    try {
      const res = await api.post(`/listings/${listing._id}/wishlist`);
      setWished((old) => ({ ...old, [listing._id]: res.data.wished }));
      notify(res.data.wished ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Failed to update wishlist", "error");
    }
  };

  const handleCopy = async (listing) => {
    const url = `${window.location.origin}/listings/${listing._id}`;
    try {
      await navigator.clipboard.writeText(url);
      notify("Link copied to clipboard!", "success");
    } catch (err) {
      toast("Failed to copy link", "error");
    }
    setActiveShare(null);
  };

  const handleWhatsApp = (listing) => {
    const url = `${window.location.origin}/listings/${listing._id}`;
    const text = encodeURIComponent(`Check out this ${listing.title} on AULoop! ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setActiveShare(null);
  };

  return (
    <PageTransition className="page-shell">
      <div className="mx-auto max-w-md">
        <div className="mb-4">
          <p className="text-sm font-bold uppercase tracking-wide text-brand">Product reels</p>
          <h1 className="text-3xl font-extrabold">Swipe-style previews</h1>
        </div>
        <div className="rounded-2xl border border-brand shadow-[0_0_20px_var(--accent-primary)] hover:shadow-[0_0_30px_var(--accent-primary)] transition-all duration-500 bg-[#000000]">
          <div className="h-[calc(100dvh-13rem)] min-h-[400px] sm:min-h-[34rem] max-h-[46rem] snap-y snap-mandatory overflow-y-auto rounded-2xl hide-scrollbar relative">
            {loading && <div className="skeleton h-full" />}
            {!loading && listings.length === 0 && <div className="grid h-full place-items-center p-8 text-center text-[#ffffff]">No reels available yet. Be the first to upload a video!</div>}
            {listings.map((listing) => (
              <section key={listing._id} className="relative h-full min-h-[400px] sm:min-h-[34rem] snap-start overflow-hidden">
                <ReelVideo src={productVideo(listing)} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-4 right-20 text-[#ffffff] sm:left-5 pointer-events-none">
                  <p className="text-sm font-bold text-mint">{sellerBadge(listing)} - Trust {sellerTrust(listing)}</p>
                  <h2 className="mt-2 line-clamp-2 text-2xl font-extrabold sm:text-3xl">{listing.title}</h2>
                  <p className="mt-2 line-clamp-2 text-base font-bold sm:text-lg">{priceLabel(listing.price)} - {meetupLabel(listing)}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#ffffff]/80">{listing.description}</p>
                </div>
                <div className="absolute bottom-8 right-4 flex flex-col gap-3">
                  <button 
                    onClick={() => handleWishlist(listing)}
                    className="grid h-12 w-12 place-items-center rounded-full bg-[#ffffff]/20 text-[#ffffff] backdrop-blur hover:bg-white/40 transition-colors" 
                    title="Wishlist"
                  >
                    <Heart size={20} fill={wished[listing._id] ? "#ffffff" : "none"} />
                  </button>
                  <button 
                    onClick={() => navigate(`/listings/${listing._id}`)}
                    className="grid h-12 w-12 place-items-center rounded-full bg-[#ffffff]/20 text-[#ffffff] backdrop-blur hover:bg-white/40 transition-colors" 
                    title="View Details / Chat"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveShare(activeShare === listing._id ? null : listing._id)}
                      className="grid h-12 w-12 place-items-center rounded-full bg-[#ffffff]/20 text-[#ffffff] backdrop-blur hover:bg-white/40 transition-colors" 
                      title="Share"
                    >
                      <Share2 size={20} />
                    </button>

                    {activeShare === listing._id && (
                      <div className="absolute right-14 bottom-0 bg-[#222222] border border-white/20 rounded-xl p-1.5 shadow-xl w-36 flex flex-col gap-1 z-10">
                        <button 
                          onClick={() => handleWhatsApp(listing)}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm font-bold text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Send size={16} className="text-emerald-400" />
                          WhatsApp
                        </button>
                        <button 
                          onClick={() => handleCopy(listing)}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm font-bold text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Link2 size={16} className="text-brand" />
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

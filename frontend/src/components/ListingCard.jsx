import { motion } from "framer-motion";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/constants";
import { meetupLabel, sellerTrust, sellerBadge, productImage } from "../utils/product.js";

const ListingCard = ({ listing, onWishlist, wished }) => {
  const image = productImage(listing);
  const trust = sellerTrust(listing);
  const badge = sellerBadge(listing);
  const location = meetupLabel(listing);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="lift-3d group flex h-full flex-col overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-soft backdrop-blur transition-all duration-200 hover:border-brand/25 hover:shadow-float"
    >
      <Link to={`/listings/${listing._id}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-blue-50">
          {image ? (
            <img src={image} alt={listing.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center text-slate-300">
              <Sparkles size={28} />
            </div>
          )}
        </div>

        <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2">
          {listing.status === "sold" && (
            <span className="rounded-full bg-coral px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">Sold</span>
          )}
          {listing.qualityScore >= 80 && listing.status !== "sold" && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand shadow-sm">Top pick</span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/listings/${listing._id}`} className="line-clamp-2 text-sm font-bold text-ink leading-snug group-hover:text-brand transition-colors flex-1">
            {listing.title}
          </Link>
          <button
            onClick={() => onWishlist?.(listing)}
            className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-2xl border transition-all duration-300 ${wished ? "border-coral/30 bg-coral text-white shadow-glow" : "border-border text-muted hover:border-coral/30 hover:text-coral hover:bg-coral/5"}`}
            aria-label="Wishlist"
          >
            <motion.div
              animate={wished ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart size={15} fill={wished ? "currentColor" : "none"} />
            </motion.div>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          {listing.category === "Campus Radar" ? (
            <p className={`text-xl font-black ${listing.lostFoundType === 'lost' ? 'text-coral' : 'text-blue-600'} capitalize`}>
              {listing.lostFoundType} Item
            </p>
          ) : (
            <p className="text-xl font-black text-ink">{formatPrice(listing.price)}</p>
          )}
          {listing.category !== "Campus Radar" && (
            <span className="max-w-[8rem] truncate rounded-full bg-elevated px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{listing.condition}</span>
          )}
        </div>

        <div className="flex min-h-7 flex-wrap gap-2">
          <span className="badge badge-brand shadow-sm">{listing.category}</span>
          <span className="badge badge-sun max-w-full truncate">{location}</span>
        </div>

        <div className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-brand" />
            <span>{trust ? `Trust ${trust}` : badge === "New Seller" ? "New Seller" : "Verified campus seller"}</span>
          </div>
        </div>

        {listing.status === "sold" ? (
          <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-elevated px-4 py-3 text-sm font-bold text-muted cursor-not-allowed">
            <MessageCircle size={14} /> Sold
          </div>
        ) : (
          <Link
            to={`/listings/${listing._id}`}
            className="btn-primary mt-auto flex w-full px-4 py-3 text-sm"
          >
            <MessageCircle size={14} /> {(listing.category === "Campus Radar" || listing.category === "Lost & Found") ? "Chat" : "Chat to buy"}
          </Link>
        )}
      </div>
    </motion.article>
  );
};

export default ListingCard;

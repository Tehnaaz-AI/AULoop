import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Cpu,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Play,
  Video
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { categories } from "../utils/constants";
import { productVideo, productImage } from "../utils/product.js";
import { useApiResource } from "../hooks/useApiResource.js";
import PageTransition from "../components/PageTransition.jsx";
import ListingCard from "../components/ListingCard.jsx";

const featureCards = [
  { Icon: ShieldCheck, title: "Verified students", body: "Campus email checks keep buyers and sellers inside the university network." },
  { Icon: MessageCircle, title: "Chat before pickup", body: "Negotiate, ask for photos, and agree on campus handoff spots before you meet." },
  { Icon: BadgeCheck, title: "Trust signals", body: "Ratings, quality scores, saved searches, and reports help good listings stand out." }
];

export default function Landing() {
  const { data: listingsData } = useApiResource(async () => (await api.get("/listings")).data, []);
  const { data: sellersData } = useApiResource(async () => (await api.get("/users/top")).data, []);
  
  const listings = listingsData?.listings ?? [];
  const reels = listings.filter(l => productVideo(l));
  
  const heroListings = (() => {
    if (!listings.length) return [];
    const byCategory = {};
    listings.forEach(l => {
      if (!byCategory[l.category]) byCategory[l.category] = [];
      byCategory[l.category].push(l);
    });
    
    const mix = [];
    const cats = Object.keys(byCategory);
    let i = 0;
    while (mix.length < 6 && i < 10) {
      for (const cat of cats) {
        if (mix.length >= 6) break;
        if (byCategory[cat][i]) mix.push(byCategory[cat][i]);
      }
      i++;
    }
    return mix;
  })();
  
  const topSellers = sellersData || [];

  return (
    <PageTransition>
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.02fr_0.98fr] lg:p-10">
          <div className="flex min-w-0 flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-brand/5 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand"
            >
              <ShieldCheck size={16} />
              Student-only resale
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-ink sm:text-6xl"
            >
              AULoop
              <span className="block gradient-text">Resell smarter on campus.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg"
            >
              A focused marketplace for students to list books, cycles, electronics, hostel essentials, and lab gear with verified profiles, quick filters, and safe pickup zones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Link to="/marketplace" className="btn-primary h-12 px-5">
                Browse deals <ArrowRight size={18} />
              </Link>
              <Link to="/sell" className="btn-secondary h-12 px-5">
                List an item
              </Link>
            </motion.div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Live listings", listings.length || "Ready"],
                ["Pickup zones", "15+"],
                ["Deal flow", "Chat-first"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-elevated p-4">
                  <p className="text-2xl font-black text-ink">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="min-w-0 rounded-xl border border-border bg-elevated p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Today on campus</p>
                <h2 className="mt-1 text-lg font-black text-ink">Fresh student listings</h2>
              </div>
              <Link to="/marketplace" className="grid h-10 w-10 place-items-center rounded-xl bg-card text-brand shadow-sm">
                <Search size={18} />
              </Link>
            </div>

            {heroListings.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {heroListings.map((listing) => (
                  <Link 
                    to={`/listings/${listing._id}`} 
                    key={listing._id} 
                    className="group flex items-center gap-4 rounded-2xl border border-white/50 bg-white/60 p-3 shadow-sm transition-all duration-300 hover:border-brand/40 hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1"
                  >
                    <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-inner">
                      {listing.images?.[0]?.url ? (
                        <img src={listing.images[0].url} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="grid h-full place-items-center text-brand/40"><Sparkles size={20} /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <p className="line-clamp-2 text-sm font-extrabold text-ink group-hover:text-brand leading-snug">{listing.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {listing.category === "Campus Radar" ? (
                          <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider ${listing.lostFoundType === "lost" ? "bg-coral/10 text-coral" : "bg-emerald-500/10 text-emerald-600"}`}>
                            {listing.lostFoundType}
                          </span>
                        ) : (
                          <span className="rounded-md bg-brand/10 px-2 py-1 text-xs font-black text-brand">₹{listing.price}</span>
                        )}
                        <span className="truncate text-xs font-bold text-muted">• {listing.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid min-h-[22rem] place-items-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <div>
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Sparkles size={24} />
                  </div>
                  <h2 className="text-xl font-black text-ink">Marketplace ready</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted">
                    Once students publish listings, this panel becomes a live showcase for the best campus deals.
                  </p>
                  <Link to="/sell" className="btn-primary mt-5 px-5 py-2.5 text-sm">Create the first listing</Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Campus Reels Section */}
      {reels.length > 0 && (
        <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-8 overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="grid h-6 w-6 place-items-center rounded-md bg-brand/10 text-brand">
                  <Play size={12} className="fill-brand" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Featured Videos</p>
              </div>
              <h2 className="text-3xl font-black text-ink tracking-tight">Campus Reels</h2>
              <p className="mt-1 text-sm font-semibold text-muted">Watch short previews of items for sale</p>
            </div>
            <Link to="/reels" className="group hidden sm:flex text-sm font-bold text-brand hover:text-white hover:bg-brand transition-all items-center gap-1.5 bg-brand/5 px-4 py-2.5 rounded-full border border-brand/15 hover:border-brand">
              View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-6 snap-x snap-mandatory px-1 relative z-10">
            {reels.slice(0, 10).map((listing, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={listing._id}
                className="snap-start shrink-0"
              >
                <div className="relative block w-44 h-72 rounded-[1.25rem] group border border-brand bg-slate-900 shadow-[0_0_15px_var(--accent-primary)] hover:shadow-[0_0_25px_var(--accent-primary)] hover:-translate-y-1.5 transition-all duration-400">
                  <Link 
                    to={`/reels`} 
                    className="absolute inset-0 rounded-[1.25rem] overflow-hidden"
                  >
                    <video 
                      src={productVideo(listing)} 
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                      muted 
                      playsInline 
                      loop 
                      onMouseOver={(e) => e.target.play().catch(()=>{})}
                      onMouseOut={(e) => e.target.pause()}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20 pointer-events-none group-hover:via-black/10 transition-colors duration-500" />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-75 group-hover:scale-100 delay-75">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <Play size={20} className="text-white fill-white ml-1 drop-shadow-md" />
                      </div>
                    </div>

                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                        <Video size={12} className="text-white opacity-80" /> 
                        Reel
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none transform group-hover:-translate-y-1 transition-transform duration-300">
                      <p className="text-sm font-black text-white line-clamp-2 leading-snug drop-shadow-md mb-2.5">{listing.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white bg-brand/90 backdrop-blur-sm border border-white/10 px-2 py-1 rounded-md shadow-sm">₹{listing.price}</span>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">{listing.category.substring(0, 8)}{listing.category.length > 8 ? ".." : ""}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 sm:hidden flex justify-center">
            <Link to="/reels" className="text-sm font-bold text-brand hover:text-white hover:bg-brand transition-all flex items-center justify-center gap-1.5 bg-brand/5 px-6 py-3 rounded-full border border-brand/15 hover:border-brand w-full">
              View all reels <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Top Sellers Section (Wall of fame) */}
      {topSellers.length > 0 && (
        <section className="page-shell pt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-hero p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 55%)" }} />
            <div className="relative z-10">
              <div className="mb-8 text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Wall of fame</p>
                <h2 className="mt-1 text-3xl font-black text-white">Top Sellers on Campus</h2>
                <p className="mt-2 text-sm text-white/80 max-w-md mx-auto">These students have the highest trust scores and most completed sales. Buy with confidence!</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {topSellers.map((seller, idx) => (
                  <motion.div 
                    key={seller._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, type: "spring" }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 text-center hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="relative mx-auto w-16 h-16 mb-3">
                      {seller.avatar?.url ? (
                        <img src={seller.avatar.url} alt="" className="w-full h-full rounded-full object-cover border-2 border-white/30 bg-white/10" />
                      ) : (
                        <div className="w-full h-full rounded-full border-2 border-white/30 bg-white/20 flex items-center justify-center text-white font-black text-xl tracking-widest">
                          {(() => {
                            const parts = (seller.name || "?").split(" ").filter(Boolean);
                            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                          })()}
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-brand text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900">
                        #{idx + 1}
                      </div>
                    </div>
                    <h3 className="text-white font-bold truncate">{seller.name}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{seller.department}</p>
                    <div className="mt-3 flex items-center justify-center gap-1 bg-white/20 rounded-lg py-1 px-2">
                      <Sparkles size={12} className="text-amber-300" />
                      <span className="text-xs font-bold text-white">Trust {seller.trustScore}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      <section className="page-shell pt-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="surface-hover rounded-xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <item.Icon size={23} />
              </div>
              <h3 className="text-lg font-black text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="page-shell pb-10 pt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Browse faster</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Popular categories</h2>
          </div>
          <Link to="/marketplace" className="hidden text-sm font-bold text-brand hover:text-blue-700 sm:inline-flex">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Campus Radar special card */}
          <Link
            to="/campus-radar"
            className="surface-hover rounded-xl border border-coral/30 bg-coral/5 p-5 shadow-soft hover:-translate-y-2 transition-all duration-300"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-coral/20 text-coral shadow-glow">
              <Search size={22} />
            </div>
            <h3 className="text-lg font-black text-coral">Campus Radar</h3>
            <p className="mt-2 text-sm leading-6 text-coral/80">Help students find their lost items on campus.</p>
          </Link>
          
          {categories.filter(c => c !== "Campus Radar" && c !== "Other").slice(0, 4).map((category, idx) => {
            const Icon = [BookOpen, Cpu, MapPin, BadgeCheck][idx] || Sparkles;
            return (
              <Link
                key={category}
                to={`/marketplace?category=${encodeURIComponent(category)}`}
                className="surface-hover rounded-xl border border-border bg-card p-5 shadow-soft hover:-translate-y-2 transition-all duration-300"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-brand">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-black text-ink">{category}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">Find {category.toLowerCase()} ready for campus pickup.</p>
              </Link>
            );
          })}
        </div>
      </section>
      
    </PageTransition>
  );
}

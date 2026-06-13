import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen, Bike, Cpu, Home, FlaskConical, Dumbbell,
  Package, Plus, Save, Search, SlidersHorizontal, X, ArrowRight, Play, Video
} from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import ListingCard from "../components/ListingCard";
import SkeletonCard from "../components/SkeletonCard";
import { categories, conditions } from "../utils/constants";
import { productVideo } from "../utils/product";
import { useUi } from "../context/UiContext";
import { useAuth } from "../context/AuthContext";

const categoryIcons = {
  Books: BookOpen, Cycles: Bike, Electronics: Cpu,
  Hostel: Home, "Lab Gear": FlaskConical, Sports: Dumbbell, Other: Package
};

const Marketplace = ({ fixedCategory }) => {
  const [listings, setListings] = useState([]);
  const reels = useMemo(() => listings.filter(l => productVideo(l)), [listings]);
  const [searchParams] = useSearchParams();
  const { notify, toast } = useUi();
  const { user } = useAuth();
  const [wished, setWished] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ q: "", category: "", condition: "", minPrice: "", maxPrice: "", sort: "newest", page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setFilters((old) => ({
      ...old,
      q: searchParams.get("q") || "",
      category: fixedCategory || searchParams.get("category") || "",
      condition: searchParams.get("condition") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      page: 1
    }));
  }, [searchParams, fixedCategory]);

  const params = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")),
    [filters]
  );

  const activeFilterChips = useMemo(
    () => [
      filters.q && { key: "q", label: `Search: ${filters.q}` },
      filters.category && { key: "category", label: filters.category },
      filters.condition && { key: "condition", label: filters.condition },
      filters.minPrice && { key: "minPrice", label: `Min Rs. ${filters.minPrice}` },
      filters.maxPrice && { key: "maxPrice", label: `Max Rs. ${filters.maxPrice}` }
    ].filter(Boolean),
    [filters]
  );

  const load = async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get("/listings", { params });
      const arr = data.listings || data;
      if (isLoadMore) {
        setListings(prev => {
          const newItems = arr.filter(item => !prev.some(p => p._id === item._id));
          return [...prev, ...newItems];
        });
      } else {
        setListings(arr);
      }
      setTotalPages(data.totalPages || 1);
      const userId = user?._id;
      setWished(prev => ({
         ...prev,
         ...Object.fromEntries(arr.map((item) => [item._id, userId ? (item.wishlistBy || []).includes(userId) : false]))
      }));
    } catch (error) {
      toast(error.response?.data?.message || "Failed to load listings", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const isLoadMore = filters.page > 1;
    const t = setTimeout(() => load(isLoadMore), 250);
    return () => clearTimeout(t);
  }, [params]);

  const update = (e) => setFilters((old) => ({ ...old, [e.target.name]: e.target.value, page: 1 }));
  const clearFilters = () => setFilters({ q: "", category: "", condition: "", minPrice: "", maxPrice: "", sort: "newest", page: 1 });
  const hasActiveFilters = activeFilterChips.length > 0;

  const removeFilter = (key) => setFilters((old) => ({ ...old, [key]: "", page: 1 }));

  const saveSearch = async () => {
    try {
      await api.post("/users/saved-searches", { ...filters, query: filters.q, name: filters.q || filters.category || "Campus search" });
      notify("Search saved", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Login to save searches", "error");
    }
  };

  const wishlist = async (listing) => {
    try {
      const { data } = await api.post(`/listings/${listing._id}/wishlist`);
      setWished((old) => ({ ...old, [listing._id]: data.wished }));
      notify(data.wished ? "Added to wishlist" : "Removed from wishlist", "success");
    } catch (error) {
      toast(error.response?.data?.message || "Login to wishlist items", "error");
    }
  };

  return (
    <div className="space-y-5">

      {/* Hero */}
      <section className="app-gradient-panel relative overflow-hidden rounded-xl p-5 shadow-soft sm:p-7">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.26) 0 1px, transparent 1px 100%), linear-gradient(180deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 100%)", backgroundSize: "32px 32px" }} />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-center">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/70">AULoop Market</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Buy smarter, sell faster, and stay within campus.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">
              Browse trusted student listings, compare prices in seconds, and connect instantly with buyers and sellers on your campus.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/marketplace" className="inline-flex items-center justify-center rounded-xl bg-card px-5 py-3 text-sm font-bold text-ink shadow-soft transition hover:-translate-y-0.5">
                Explore listings
              </Link>
              <Link to="/sell" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/22">
                <Plus size={16} /> Sell an item
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: `${listings.length} items`, caption: "Active campus listings" },
              { label: "Verified sellers", caption: "Buyer safety across every deal" },
              { label: "Fast chat", caption: "Contact sellers instantly" },
              { label: "Easy filters", caption: "Find the right listing quickly" }
            ].map((item) => (
              <div key={item.label} className="lift-3d rounded-xl border border-white/20 bg-white/14 p-4 text-white backdrop-blur-md">
                <p className="text-xl font-black">{item.label}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/70">{item.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Reels Section */}
      {reels.length > 0 && (
        <section className="mb-5 rounded-xl border border-border bg-card p-5 sm:p-7 overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="grid h-5 w-5 place-items-center rounded-md bg-brand/10 text-brand">
                  <Play size={10} className="fill-brand" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand">Featured Videos</p>
              </div>
              <h2 className="text-2xl font-black text-ink tracking-tight">Campus Reels</h2>
              <p className="mt-0.5 text-xs font-semibold text-muted">Watch short previews of items for sale</p>
            </div>
            <Link to="/reels" className="group hidden sm:flex text-xs font-bold text-brand hover:text-white hover:bg-brand transition-all items-center gap-1.5 bg-brand/5 px-3 py-2 rounded-full border border-brand/15 hover:border-brand">
              View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory px-1 relative z-10">
            {reels.slice(0, 10).map((listing, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={listing._id}
                className="snap-start shrink-0"
              >
                <div className="relative block w-36 h-60 sm:w-40 sm:h-64 rounded-2xl group border border-brand bg-slate-900 shadow-[0_0_15px_var(--accent-primary)] hover:shadow-[0_0_25px_var(--accent-primary)] hover:-translate-y-1 transition-all duration-400">
                  <Link 
                    to={`/reels`} 
                    className="absolute inset-0 rounded-2xl overflow-hidden"
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
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <Play size={16} className="text-white fill-white ml-0.5 drop-shadow-md" />
                      </div>
                    </div>

                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-0.5 text-[9px] font-black text-white tracking-widest uppercase flex items-center gap-1 shadow-sm">
                        <Video size={10} className="text-white opacity-80" /> 
                        Reel
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 pointer-events-none transform group-hover:-translate-y-1 transition-transform duration-300">
                      <p className="text-xs font-black text-white line-clamp-2 leading-snug drop-shadow-md mb-2">{listing.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white bg-brand/90 backdrop-blur-sm border border-white/10 px-1.5 py-0.5 rounded shadow-sm">₹{listing.price}</span>
                        <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/5 truncate max-w-[60px] text-right">{listing.category}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 sm:hidden flex justify-center">
            <Link to="/reels" className="text-xs font-bold text-brand hover:text-white hover:bg-brand transition-all flex items-center justify-center gap-1.5 bg-brand/5 px-4 py-2 rounded-full border border-brand/15 hover:border-brand w-full">
              View all reels <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Category pills */}
      {!fixedCategory && (
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setFilters((o) => ({ ...o, category: "", page: 1 }))}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${!filters.category ? "bg-brand text-white border-brand shadow-sm" : "bg-card text-muted border-border hover:border-brand/40 hover:text-brand"
              }`}
          >
            All
          </button>
          {categories.filter(c => c !== "Lost & Found").map((cat) => {
            const Icon = categoryIcons[cat] || Package;
            return (
              <button
                key={cat}
                onClick={() => setFilters((o) => ({ ...o, category: o.category === cat ? "" : cat, page: 1 }))}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all ${filters.category === cat ? "bg-brand text-white border-brand shadow-sm" : "bg-card text-muted border-border hover:border-brand/40 hover:text-brand"
                  }`}
              >
                <Icon size={12} /> {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Search bar */}
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:shadow-glow">
          <Search size={15} className="text-muted flex-shrink-0" />
          <input
            name="q"
            value={filters.q}
            onChange={update}
            placeholder="Search books, cycles, calculators..."
            className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400 text-ink"
          />
          {filters.q && (
            <button onClick={() => setFilters((o) => ({ ...o, q: "", page: 1 }))} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </label>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-all ${showFilters || hasActiveFilters ? "bg-brand/10 border-brand/30 text-brand" : "bg-card border-border text-muted hover:border-slate-300 hover:text-ink"
            }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="h-4 w-4 rounded-full bg-brand text-white text-[9px] font-black flex items-center justify-center">
              {[filters.category, filters.condition, filters.minPrice, filters.maxPrice].filter(Boolean).length}
            </span>
          )}
        </button>

        <button onClick={saveSearch} className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-muted hover:border-brand/40 hover:text-brand transition-all" title="Save search">
          <Save size={15} />
        </button>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => removeFilter(chip.key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-bold text-brand"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
        </div>
      )}

      {/* Expanded filters */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-card animate-[slideUp_0.2s_ease-out]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Condition</label>
              <select name="condition" value={filters.condition} onChange={update} className="input">
                <option value="">Any condition</option>
                {conditions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min price (Rs.)</label>
              <input name="minPrice" value={filters.minPrice} onChange={update} placeholder="0" type="number" className="input" />
            </div>
            <div>
              <label className="label">Max price (Rs.)</label>
              <input name="maxPrice" value={filters.maxPrice} onChange={update} placeholder="Any" type="number" className="input" />
            </div>
            <div>
              <label className="label">Sort by</label>
              <select name="sort" value={filters.sort} onChange={update} className="input">
                <option value="newest">Newest first</option>
                <option value="priceLow">Price: low to high</option>
                <option value="priceHigh">Price: high to low</option>
                <option value="trusted">Quality score</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs font-bold text-coral hover:text-rose-600 transition-colors flex items-center gap-1">
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="overflow-y-scroll max-h-[800px] p-2 -mx-2">
        {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
        ) : listings.length ? (
          <>
            <p className="text-xs font-semibold text-muted mb-3">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}{filters.category ? ` in ${filters.category}` : ""}
            </p>
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.08 } }
              }}
            >
              {listings.map((listing) => (
                <motion.div
                  key={listing._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                  }}
                >
                  <ListingCard listing={listing} onWishlist={wishlist} wished={wished[listing._id]} />
                </motion.div>
              ))}
            </motion.div>
            {filters.page < totalPages && (
              <div className="mt-8 mb-4 flex justify-center">
                <button
                  onClick={() => setFilters(old => ({ ...old, page: old.page + 1 }))}
                  disabled={loadingMore}
                  className="btn-primary"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Nothing here yet"
            body="Try different filters or be the first to list something in this category."
            action={<Link to="/sell" className="btn-primary text-sm"><Plus size={15} /> List an item</Link>}
          />
        )}
      </div>
    </div>
  );
};

export default Marketplace;

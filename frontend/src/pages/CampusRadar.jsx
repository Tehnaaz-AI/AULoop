import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, SlidersHorizontal, X, Plus, Radar, AlertTriangle
} from "lucide-react";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import ListingCard from "../components/ListingCard";
import SkeletonCard from "../components/SkeletonCard";
import { useUi } from "../context/UiContext";
import { useAuth } from "../context/AuthContext";

const CampusRadar = () => {
  const [listings, setListings] = useState([]);
  const [searchParams] = useSearchParams();
  const { notify, toast } = useUi();
  const { user } = useAuth();
  const [wished, setWished] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Custom filters for Campus Radar
  const [filters, setFilters] = useState({ 
    q: searchParams.get("q") || "", 
    lostFoundType: searchParams.get("lostFoundType") || "", 
    sort: "newest",
    category: "Campus Radar" // Hardcoded to this category
  });

  const params = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== "")),
    [filters]
  );

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/listings", { params });
      const arr = data.listings || data;
      setListings(arr);
      const userId = user?._id;
      setWished(Object.fromEntries(arr.map((item) => [item._id, userId ? (item.wishlistBy || []).includes(userId) : false])));
    } catch (error) {
      toast(error.response?.data?.message || "Failed to load listings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [params]);

  const update = (e) => setFilters((old) => ({ ...old, [e.target.name]: e.target.value }));

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
      <section className="app-gradient-panel relative overflow-hidden rounded-xl p-5 shadow-soft sm:p-7 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 55%)" }} />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] items-center">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/70 flex items-center gap-2">
              <Radar size={14} /> Campus Radar
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Did you lose something? Or find something?
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">
              Help a fellow student out! Report lost items to get the community's help, or post found items so they can be returned to their owner.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/sell?category=Campus%20Radar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-600 px-5 py-3 text-sm font-bold shadow-soft transition hover:-translate-y-0.5">
                <Plus size={16} /> Report an item
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:grid place-items-center">
             <div className="h-32 w-32 rounded-full border-4 border-white/20 flex items-center justify-center animate-[pulse-soft_2s_ease-in-out_infinite]">
                <Radar size={64} className="text-white/80" />
             </div>
          </div>
        </div>
      </section>

      {/* Type Toggle Tabs */}
      <div className="flex gap-2 p-1 bg-elevated rounded-xl border border-border max-w-md mx-auto">
        {[
          { id: "", label: "All Items" },
          { id: "lost", label: "Looking For (Lost)" },
          { id: "found", label: "I Found (Found)" }
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setFilters(o => ({ ...o, lostFoundType: tab.id }))}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              filters.lostFoundType === tab.id
                ? "bg-card shadow-sm text-brand border border-border"
                : "text-muted hover:text-ink hover:bg-black/5 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex gap-2 max-w-xl mx-auto">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:shadow-glow">
          <Search size={15} className="text-muted flex-shrink-0" />
          <input
            name="q"
            value={filters.q}
            onChange={update}
            placeholder="Search keys, ID cards, notebooks..."
            className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400 text-ink"
          />
          {filters.q && (
            <button onClick={() => setFilters((o) => ({ ...o, q: "" }))} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </label>
      </div>

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
              {listings.length} item{listings.length !== 1 ? "s" : ""} on the radar
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
          </>
        ) : (
          <EmptyState
            title="Nothing on the radar"
            body="No items match your search. If you lost something, make sure to report it!"
            action={<Link to="/sell?category=Campus%20Radar" className="btn-primary text-sm"><Plus size={15} /> Report an item</Link>}
          />
        )}
      </div>
    </div>
  );
};

export default CampusRadar;

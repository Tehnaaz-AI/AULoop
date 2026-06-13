import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Package, ShieldCheck, Star, Trash2, Plus, X, Play } from "lucide-react";
import api from "../services/api";
import { productVideo } from "../utils/product.js";
import EmptyState from "../components/EmptyState";
import ListingCard from "../components/ListingCard";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { useStore } from "../store/useStore.js";

const STATUS_COLORS = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reserved:  "bg-amber-100 text-amber-700 border-amber-200",
  sold:      "bg-elevated text-muted border-border"
};

const Dashboard = () => {
  const { user, setUser: setAuthUser } = useAuth();
  const { notify } = useUi();
  const { setUser: setStoreUser } = useStore();
  const [listings, setListings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searches, setSearches] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [ratings, setRatings] = useState({});
  const [activeTab, setActiveTab] = useState("listings");
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [buyerForm, setBuyerForm] = useState({
    otp: ""
  });

  useEffect(() => {
    if (!user?._id) return;

    Promise.all([
      api.get("/listings/mine"),
      api.get("/users/wishlist"),
      api.get("/users/saved-searches"),
      api.get("/users/purchases")
    ]).then(([mine, wished, saved, details]) => {
      setListings(mine.data);
      setWishlist(wished.data);
      setSearches(saved.data);
      setPurchases(details.data || []);
    }).catch((err) => {
      console.error(err);
      notify(err.response?.data?.message || "Failed to load dashboard data");
    });
  }, [user?._id, notify]);

  const openSoldModal = (listing) => {
    setSelectedListing(listing);
    setBuyerForm({
      otp: ""
    });
    setShowSoldModal(true);
  };

  const setStatus = async (id, status) => {
    if (status === "sold") {
      const listing = listings.find(item => item._id === id);
      openSoldModal(listing);
      return;
    }
    
    try {
      const { data } = await api.patch(`/listings/${id}/status`, { status });
      setListings(old => old.map(item => item._id === id ? data : item));
      
      // Fetch updated user data to refresh stats like completedSales
      const { data: userData } = await api.get("/auth/me");
      
      // Update both AuthContext and Store to keep them in sync
      setAuthUser(userData);
      setStoreUser(userData);
      
      notify(`Listing marked ${status}`, "success");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update status", "error");
    }
  };
  
  const confirmMarkAsSold = async () => {
    try {
      const { data } = await api.patch(`/listings/${selectedListing._id}/status`, {
        status: "sold",
        otp: buyerForm.otp,
      });
      
      setListings(old => old.map(item => item._id === selectedListing._id ? data : item));
      
      // Fetch updated user data to refresh stats like completedSales
      const { data: userData } = await api.get("/auth/me");
      setAuthUser(userData);
      setStoreUser(userData);
      
      setShowSoldModal(false);
      setSelectedListing(null);
      notify("Listing marked as sold! 🎉", "success");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to mark as sold", "error");
    }
  };

  const rateSeller = async (listingId) => {
    try {
      const item = ratings[listingId] || {};
      const rating = typeof item.rating === "number" ? item.rating : 5;
      const comment = item.comment || "";
      await api.post(`/reviews/listings/${listingId}`, { rating, comment });
      // Update local state to mark this item as reviewed
      setPurchases(old => old.map(purchase => 
        purchase._id === listingId 
          ? { ...purchase, reviewedByBuyer: true } 
          : purchase
      ));
      
      // Fetch updated user data to refresh review stats
      const { data: userData } = await api.get("/auth/me");
      setAuthUser(userData);
      setStoreUser(userData);
      
      notify("Seller rated successfully", "success");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to submit rating", "error");
    }
  };

  const deleteSearch = async (id) => {
    try {
      await api.delete(`/users/saved-searches/${id}`);
      setSearches(old => old.filter(item => item._id !== id));
      notify("Saved search removed", "success");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const reels = listings.filter(l => productVideo(l));

  const tabs = [
    { key: "listings",  label: "My Listings",  count: listings.length },
    { key: "reels",     label: "My Reels",     count: reels.length },
    { key: "wishlist",  label: "Saved Items",      count: wishlist.length },
    { key: "purchases", label: "Purchases",     count: purchases.length },
    { key: "searches",  label: "Saved Searches",count: searches.length }
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Stats header */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2 rounded-2xl bg-hero p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 55%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={16} className="text-brand" />
              <p className="text-xs font-bold text-white/60 uppercase tracking-wide">Dashboard</p>
            </div>
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <p className="text-white/50 text-sm mt-1">{user?.email}</p>
          </div>
        </div>
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-amber-400" />
            <p className="text-xs font-bold text-muted uppercase tracking-wide">Reviews</p>
          </div>
          <p className="text-4xl font-black text-ink">{user?.reviewCount ?? 0}</p>
          {user?.reviewAverage > 0 && <p className="text-xs text-muted mt-1">{user.reviewAverage.toFixed(1)} avg rating</p>}
        </div>
        <div className="card p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-brand" />
            <p className="text-xs font-bold text-muted uppercase tracking-wide">Sales</p>
          </div>
          <p className="text-4xl font-black text-ink">{user?.completedSales ?? 0}</p>
          <p className="text-xs text-muted mt-1">completed</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/sell" className="card flex flex-col gap-3 rounded-[1.5rem] border border-border bg-card p-5 text-center hover:-translate-y-1 hover:shadow-card-hover transition-all shadow-soft">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-3xl bg-hero text-white shadow-glow">
            <Plus size={18} />
          </div>
          <p className="font-bold text-ink">Sell</p>
          <p className="text-sm text-muted">Add your item so campus buyers can discover it fast.</p>
        </Link>
        <Link to="/marketplace" className="card flex flex-col gap-3 rounded-[1.5rem] border border-border bg-card p-5 text-center hover:-translate-y-1 hover:shadow-card-hover transition-all shadow-soft">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-3xl bg-elevated text-brand shadow-sm">
            <Package size={18} />
          </div>
          <p className="font-bold text-ink">Marketplace</p>
          <p className="text-sm text-muted">Find trending campus listings and compare prices.</p>
        </Link>
        <Link to="/saved" className="card flex flex-col gap-3 rounded-[1.5rem] border border-border bg-card p-5 text-center hover:-translate-y-1 hover:shadow-card-hover transition-all shadow-soft">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-elevated to-border text-ink shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <p className="font-bold text-ink">Saved</p>
          <p className="text-sm text-muted">Keep an eye on favorite items and act before they’re gone.</p>
        </Link>
        <Link to="/notifications" className="card flex flex-col gap-3 rounded-[1.5rem] border border-border bg-card p-5 text-center hover:-translate-y-1 hover:shadow-card-hover transition-all shadow-soft">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-3xl bg-card text-brand shadow-glow">
            <LayoutDashboard size={18} />
          </div>
          <p className="font-bold text-ink">Notifications</p>
          <p className="text-sm text-muted">See buyer messages and listing alerts in one place.</p>
        </Link>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border overflow-x-scroll">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === key
                  ? "text-brand border-b-2 border-brand bg-brand/5"
                  : "text-muted hover:text-slate-600"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-black ${activeTab === key ? "bg-brand text-white" : "bg-elevated text-muted"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* My Reels */}
          {activeTab === "reels" && (
            <div className="overflow-y-scroll max-h-[420px] pr-1.5 hide-scrollbar">
              {reels.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                  {reels.map(listing => (
                    <div className="relative block aspect-[9/16] rounded-2xl group border border-brand shadow-[0_0_15px_var(--accent-primary)] hover:shadow-[0_0_25px_var(--accent-primary)] hover:-translate-y-1 transition-all duration-300 bg-black">
                      <Link 
                        key={listing._id} 
                        to={`/reels`} 
                        className="absolute inset-0 rounded-2xl overflow-hidden"
                      >
                        <video 
                          src={productVideo(listing)} 
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" 
                          muted 
                          playsInline 
                          loop 
                          onMouseOver={(e) => e.target.play().catch(()=>{})}
                          onMouseOut={(e) => e.target.pause()}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scale-75 group-hover:scale-100">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center">
                            <Play size={16} className="text-white fill-white ml-1" />
                          </div>
                        </div>

                        <div className="absolute top-2 left-2 pointer-events-none">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${STATUS_COLORS[listing.status] || "bg-elevated text-muted"}`}>
                            {listing.status}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                          <p className="text-xs font-bold text-white line-clamp-2 leading-tight drop-shadow-md mb-1.5">{listing.title}</p>
                          <span className="text-xs font-black text-brand bg-white/10 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-md">₹{listing.price}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No reels yet" 
                  body="Upload a video when creating a listing to make it appear as a reel."
                  action={<Link to="/sell" className="btn-primary text-sm">Create listing with video</Link>} 
                />
              )}
            </div>
          )}

          {/* My Listings */}
          {activeTab === "listings" && (
            <div className="overflow-y-scroll max-h-[420px] pr-1.5">
              {listings.length ? (
                <div className="space-y-2.5">
                  {listings.map(listing => (
                    <div key={listing._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-4 hover:border-brand/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link to={`/listings/${listing._id}`} className="font-bold text-ink hover:text-brand transition-colors truncate block">{listing.title}</Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge border text-[10px] ${STATUS_COLORS[listing.status] || "bg-elevated text-muted border-border"}`}>
                            {listing.status}
                          </span>
                          <span className="text-xs text-muted">Quality {listing.qualityScore}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {listing.status !== "sold" ? (
                          ["available", "reserved", "sold"].map(status => (
                            <button
                              key={status}
                              onClick={() => setStatus(listing._id, status)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                                listing.status === status
                                  ? "bg-brand text-white border-brand"
                                  : "border-border text-muted hover:border-brand/40 hover:text-brand"
                              }`}
                            >
                              {status}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs font-bold text-muted flex items-center gap-1">
                            ✓ Item marked as sold
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No listings yet" body="Publish your first item to start receiving campus buyer chats."
                  action={<Link to="/sell" className="btn-primary text-sm">Create listing</Link>} />
              )}
            </div>
          )}

          {/* Wishlist */}
          {activeTab === "wishlist" && (
            <div className="overflow-y-scroll max-h-[420px] pr-1.5">
              {wishlist.length ? (
                <div className="space-y-2.5">
                  {wishlist.map(listing => (
                    <div key={listing._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated p-4 hover:border-brand/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link to={`/listings/${listing._id}`} className="font-bold text-ink hover:text-brand transition-colors truncate block">{listing.title}</Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge border text-[10px] ${STATUS_COLORS[listing.status] || "bg-elevated text-muted border-border"}`}>
                            {listing.status}
                          </span>
                          <span className="text-xs font-bold text-brand ml-1">₹{listing.price}</span>
                          <span className="text-xs text-muted">• {listing.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/listings/${listing._id}`} className="btn-primary text-xs px-4 py-2">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Wishlist is empty" body="Save items from the marketplace to compare them later." />
              )}
            </div>
          )}

          {/* Purchases */}
          {activeTab === "purchases" && (
            <div className="overflow-y-scroll max-h-[420px] pr-1.5">
              {purchases.length ? (
                <div className="space-y-3">
                  {purchases.map(item => (
                    <div key={item._id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <Link to={`/listings/${item._id}`} className="font-bold text-ink hover:text-brand transition-colors">{item.title}</Link>
                          <p className="text-sm text-muted mt-0.5">Seller: {item.seller?.name} · {item.seller?.phone}</p>
                        </div>
                        <span className="badge badge-brand flex-shrink-0">Purchased</span>
                      </div>
                      {!item.reviewedByBuyer ? (
                        <div className="grid gap-2 sm:grid-cols-[8rem_1fr_auto] pt-3 border-t border-border">
                          <select
                            value={ratings[item._id]?.rating || 5}
                            onChange={(e) => setRatings(old => ({ ...old, [item._id]: { ...(old[item._id] || {}), rating: Number(e.target.value) } }))}
                            className="input text-sm py-2"
                          >
                            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
                          </select>
                          <input
                            value={ratings[item._id]?.comment || ""}
                            onChange={(e) => setRatings(old => ({ ...old, [item._id]: { ...(old[item._id] || {}), comment: e.target.value } }))}
                            placeholder="Leave a review for the seller…"
                            className="input text-sm py-2"
                          />
                          <button onClick={() => rateSeller(item._id)} className="btn-primary text-sm py-2 px-4">Rate</button>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-brand pt-2 border-t border-border">✓ Seller already rated</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No purchases yet" body="Items you buy will appear here." />}
            </div>
          )}

          {/* Saved searches */}
          {activeTab === "searches" && (
            <div className="overflow-y-scroll max-h-[420px] pr-1.5">
              {searches.length ? (
                <div className="space-y-2">
                  {searches.map(item => (
                    <div key={item._id} className="flex items-center justify-between rounded-xl border border-border bg-elevated px-4 py-3 hover:border-brand/30 transition-colors">
                      <div>
                        <p className="font-bold text-ink text-sm">{item.name}</p>
                        {item.category && <p className="text-xs text-muted mt-0.5">{item.category}{item.condition ? ` · ${item.condition}` : ""}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/marketplace?${new URLSearchParams({ q: item.query || "", category: item.category || "", condition: item.condition || "", minPrice: item.minPrice || "", maxPrice: item.maxPrice || "" }).toString()}`}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          Open
                        </Link>
                        <button onClick={() => deleteSearch(item._id)} className="h-8 w-8 flex items-center justify-center rounded-xl border border-border text-muted hover:border-coral/30 hover:text-coral transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No saved searches" body="Save a search from the marketplace to get notified about new listings." />}
            </div>
          )}
        </div>
      </div>
      
      {/* Sold Modal */}
      {showSoldModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-black text-ink">Mark as Sold</h3>
              <button onClick={() => setShowSoldModal(false)} className="h-8 w-8 rounded-full hover:bg-elevated flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-muted mb-2">Listing</p>
                <p className="text-ink font-semibold">{selectedListing.title}</p>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-sm text-emerald-700 font-semibold flex items-start gap-1.5">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                  Ask the buyer for their 4-digit Handover OTP to securely lock this sale and prevent scams.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block label">Buyer's Handover OTP <span className="text-coral">*</span></label>
                  <input 
                    type="text" 
                    className="input font-mono tracking-[0.5em] text-lg text-center" 
                    value={buyerForm.otp}
                    onChange={(e) => setBuyerForm({ otp: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                    placeholder="••••"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowSoldModal(false)} 
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmMarkAsSold}
                  disabled={buyerForm.otp.length !== 4}
                  className="btn-primary flex-1"
                >
                  Mark as Sold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

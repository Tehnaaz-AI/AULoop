import { useEffect, useState } from "react";
import api from "../services/api";
import PageTransition from "../components/PageTransition.jsx";
import ListingCard from "../components/ListingCard.jsx";
import { useUi } from "../context/UiContext";

export default function Saved() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { notify } = useUi();

  const load = async () => {
    try {
      const { data } = await api.get("/users/wishlist");
      setListings(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load saved listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const wishlist = async (listing) => {
    try {
      await api.post(`/listings/${listing._id}/wishlist`);
      setListings((prev) => prev.filter((item) => item._id !== listing._id));
      notify("Removed from saved items", "success");
    } catch {
      notify("Failed to update saved items", "error");
    }
  };

  return (
    <PageTransition className="page-shell">
      <h1 className="text-4xl font-extrabold">Saved products</h1>
      <p className="mt-2 text-muted">Wishlist items are loaded from your campus resells.</p>
      <div className="overflow-y-scroll max-h-[800px] mt-6 pr-2">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="skeleton h-80 rounded-[8px]" />)}
          {!loading && listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} onWishlist={wishlist} wished={true} />
          ))}
        </div>
        {!loading && listings.length === 0 && <p className="mt-6 rounded-[8px] bg-card p-5 font-semibold shadow-soft">No saved listings yet.</p>}
      </div>
      {error && <p className="mt-4 font-bold text-coral">{error}</p>}
    </PageTransition>
  );
}

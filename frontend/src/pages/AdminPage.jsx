import { useEffect, useState } from "react";
import { AlertCircle, Ban, Eye, EyeOff, Shield, Trash2 } from "lucide-react";
import api from "../services/api";
import { useUi } from "../context/UiContext";
import { formatPrice } from "../utils/constants";

const AdminPage = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [listings, setListings] = useState([]);
  const [spots, setSpots] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState({});
  const [activeTab, setActiveTab] = useState("reports");
  const { notify } = useUi();

  const load = async () => {
    const [statsRes, usersRes, reportsRes, listingsRes, spotsRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/reports"),
      api.get("/admin/listings"),
      api.get("/spots/pending")
    ]);
    setStats(statsRes.data);
    setUsers(usersRes.data);
    setReports(reportsRes.data);
    setListings(listingsRes.data);
    setSpots(spotsRes.data);
  };

  useEffect(() => {
    load().catch((err) => notify(err.response?.data?.message || "Admin data failed", "error"));
  }, [notify]);

  const ban = async (user) => {
    await api.patch(`/admin/users/${user._id}/ban`, { isBanned: !user.isBanned, banReason: user.isBanned ? "" : "Admin moderation action" });
    notify(user.isBanned ? "User unbanned successfully!" : "User banned successfully!", "success");
    load();
  };

  const resolveReport = async (report, status) => {
    try {
      await api.patch(`/reports/${report._id}`, { status, adminNote: `Marked ${status}` });
      notify(`Report ${status} successfully!`, "success");
      load();
    } catch (err) {
      notify(err.response?.data?.message || `Failed to ${status} report`, "error");
    }
  };

  const hideListing = async (listingId) => {
    if (!reason[listingId]?.trim()) return notify("Please provide a reason to hide", "error");
    try {
      await api.patch(`/admin/listings/${listingId}/hide`, { status: "hidden", reason: reason[listingId] });
      notify("Listing hidden successfully!", "success"); 
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to hide listing", "error");
    }
  };

  const unhideListing = async (listingId) => {
    try {
      await api.patch(`/admin/listings/${listingId}/hide`, { status: "available", reason: "" });
      notify("Listing visible again!", "success"); 
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to unhide listing", "error");
    }
  };

  const removeListing = async (listingId) => {
    if (!reason[listingId]?.trim()) return notify("Please provide a reason to remove", "error");
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      await api.patch(`/admin/listings/${listingId}/remove`, { reason: reason[listingId] });
      notify("Listing permanently removed!", "success"); 
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to remove listing", "error");
    }
  };

  const openUser = async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    setSelectedUser(data);
  };

  const tabs = [
    { key: "reports",  label: "Reports",  count: reports.length },
    { key: "spots",    label: "Spots",    count: spots.length },
    { key: "listings", label: "Listings", count: listings.length },
    { key: "users",    label: "Users",    count: users.length }
  ];

  const updateSpotStatus = async (id, status) => {
    try {
      await api.patch(`/spots/${id}`, { status });
      notify(`Spot ${status} successfully!`, "success");
      load();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update spot", "error");
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="rounded-2xl app-gradient-panel p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10 z-0" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#fff]/20 flex items-center justify-center backdrop-blur-sm">
            <Shield size={20} className="text-[#fff]" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#fff]/80">Admin Console</p>
            <h1 className="text-xl font-black text-[#fff]">Moderate the marketplace</h1>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(stats).map(([key, value], idx) => (
          <div key={key} className="card p-4 animate-[slideIn_0.3s_ease-out]" style={{ animationDelay: `${idx * 0.05}s` }}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-2xl font-black text-brand mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
                activeTab === key ? "text-brand border-b-2 border-brand bg-brand/5" : "text-muted hover:text-slate-600"
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
          {/* Reports */}
          {activeTab === "reports" && (
            <div className="space-y-3 overflow-y-scroll max-h-[600px] pr-2 pb-2">
              {reports.length === 0 && <p className="text-center text-sm text-muted py-10">No reports. All good!</p>}
              {reports.map((report, idx) => (
                <div key={report._id} className="rounded-xl border border-border p-4 hover:border-brand/30 transition-colors animate-[slideIn_0.3s_ease-out]" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`badge text-[10px] ${report.status === "resolved" ? "bg-emerald-100 text-emerald-700" : report.status === "dismissed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {report.status}
                        </span>
                        <p className="font-bold text-ink text-sm">{report.reason}</p>
                      </div>
                      <p className="text-xs text-muted">By {report.reporter?.email}</p>
                      {report.details && <p className="mt-2 text-sm text-muted">{report.details}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 items-start">
                      {report.listing?._id && (
                        <button onClick={() => hideListing(report.listing._id)} className="flex items-center gap-1.5 rounded-xl border border-coral/30 px-3 py-1.5 text-xs font-bold text-coral hover:bg-coral/5 transition">
                          <EyeOff size={12} /> Hide listing
                        </button>
                      )}
                      <button onClick={() => resolveReport(report, "resolved")} className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition">Resolve</button>
                      <button onClick={() => resolveReport(report, "dismissed")} className="rounded-xl bg-slate-400 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-500 transition">Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Spots */}
          {activeTab === "spots" && (
            <div className="space-y-3 overflow-y-scroll max-h-[600px] pr-2 pb-2">
              {spots.length === 0 && <p className="text-center text-sm text-muted py-10">No pending spot requests.</p>}
              {spots.map((spot, idx) => (
                <div key={spot._id} className="rounded-xl border border-border p-4 hover:border-brand/30 transition-colors animate-[slideIn_0.3s_ease-out]" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <p className="font-black text-ink text-sm">"{spot.name}"</p>
                      <p className="text-xs text-muted mt-1">Requested by: {spot.requestedBy?.name} ({spot.requestedBy?.email})</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => updateSpotStatus(spot._id, "approved")} className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition">Approve</button>
                      <button onClick={() => updateSpotStatus(spot._id, "rejected")} className="rounded-xl bg-coral px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Listings */}
          {activeTab === "listings" && (
            <div className="space-y-3 overflow-y-scroll max-h-[600px] pr-2 pb-2">
              {listings.map((listing, idx) => (
                <div key={listing._id} className="rounded-xl border border-border p-4 hover:border-brand/30 transition-colors animate-[slideIn_0.3s_ease-out]" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge text-[10px] ${listing.status === "sold" ? "bg-emerald-100 text-emerald-700" : listing.status === "hidden" ? "bg-amber-100 text-amber-700" : "badge-brand"}`}>
                          {listing.status}
                        </span>
                        <p className="font-bold text-ink text-sm truncate">{listing.title}</p>
                      </div>
                      <p className="text-xs font-bold text-brand">{formatPrice(listing.price)} · {listing.category} · {listing.condition}</p>
                      <p className="text-xs text-muted mt-0.5">Seller: {listing.seller?.name} ({listing.seller?.email})</p>
                      {listing.status === "sold" && listing.soldTo && (
                        <p className="text-xs text-emerald-600 mt-0.5 font-bold">Sold to: {listing.soldTo?.name} ({listing.soldTo?.email})</p>
                      )}
                      {listing.hiddenReason && <p className="text-xs font-bold text-coral mt-1">Reason: {listing.hiddenReason}</p>}
                    </div>
                    {listing.status !== "sold" && (
                      <div className="space-y-2 flex-shrink-0">
                        <input
                          value={reason[listing._id] || ""}
                          onChange={(e) => setReason(old => ({ ...old, [listing._id]: e.target.value }))}
                          placeholder="Reason…"
                          className="input text-xs py-1.5 w-44"
                        />
                        <div className="flex gap-1.5">
                          {listing.status === "hidden" ? (
                            <button onClick={() => unhideListing(listing._id)} className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition">
                              <Eye size={11} /> Unhide
                            </button>
                          ) : (
                            <button onClick={() => hideListing(listing._id)} className="flex items-center gap-1 rounded-xl border border-coral/30 px-3 py-1.5 text-xs font-bold text-coral hover:bg-coral/5 transition">
                              <EyeOff size={11} /> Hide
                            </button>
                          )}
                          <button onClick={() => removeListing(listing._id)} className="flex items-center gap-1 rounded-xl bg-coral px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition">
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div>
              {selectedUser && (
                <div className="mb-5 rounded-xl border border-brand/20 bg-brand/5 p-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg font-black text-ink">{selectedUser.user.name}</h2>
                      <p className="text-sm text-muted">{selectedUser.user.email} · {selectedUser.user.phone}</p>
                      <div className="flex gap-4 mt-2 text-xs font-bold">
                        <span className="text-emerald-600">Sold: {selectedUser.selling?.filter(i => i.status === "sold").length || 0}</span>
                        <span className="text-brand">Purchased: {selectedUser.purchased?.length || 0}</span>
                        <span className="text-amber-600">Reviews: {selectedUser.reviews?.length || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="btn-secondary text-xs px-3 py-1.5">Close</button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2 text-sm">
                    <div>
                      <p className="font-black text-ink mb-2">Listings</p>
                      <div className="overflow-y-scroll max-h-40 pr-2">
                      {selectedUser.selling?.map(item => (
                        <p key={item._id} className="border-b border-border py-1.5 flex justify-between">
                          <span className="truncate">{item.title}</span>
                          <span className="badge badge-brand ml-2 flex-shrink-0">{item.status}</span>
                        </p>
                      ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-ink mb-2">Purchases</p>
                      <div className="overflow-y-scroll max-h-40 pr-2">
                      {selectedUser.purchased?.map(item => (
                        <p key={item._id} className="border-b border-border py-1.5 flex justify-between">
                          <span className="truncate">{item.title}</span>
                          <span className="text-muted ml-2 flex-shrink-0">{formatPrice(item.price)}</span>
                        </p>
                      ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-y-scroll max-h-[600px] pb-2">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-elevated border-b border-border">
                    <tr>
                      {["Name","Email","Role","Status","Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-black uppercase tracking-wide text-muted">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u._id} className="border-b border-border hover:bg-elevated transition animate-[slideIn_0.3s_ease-out]" style={{ animationDelay: `${idx * 0.02}s` }}>
                        <td className="px-4 py-3 font-bold text-ink">{u.name}</td>
                        <td className="px-4 py-3 text-muted text-xs">{u.email}</td>
                        <td className="px-4 py-3"><span className="badge bg-elevated text-muted">{u.role}</span></td>
                        <td className="px-4 py-3">
                          <span className={`badge text-[10px] ${u.isBanned ? "bg-rose-100 text-rose-700" : u.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {u.isBanned ? "Banned" : u.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => openUser(u._id)} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-muted hover:border-brand/40 hover:text-brand transition">View</button>
                            <button disabled={u.role === "admin"} onClick={() => ban(u)} className="rounded-lg border border-border px-2.5 py-1 text-xs font-bold text-muted hover:border-coral/30 hover:text-coral transition disabled:opacity-30">
                              <Ban size={11} className="inline mr-0.5" />{u.isBanned ? "Unban" : "Ban"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

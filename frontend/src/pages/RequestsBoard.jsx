import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Sparkles, MessageCircle } from "lucide-react";
import api from "../services/api";
import { useUi } from "../context/UiContext";
import PageTransition from "../components/PageTransition";
import { formatPrice } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

const RequestsBoard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { notify } = useUi();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", description: "", budget: "" });

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/requests");
      setRequests(data);
    } catch (err) {
      notify("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return notify("Title is required", "error");
    try {
      await api.post("/requests", {
        title: form.title,
        description: form.description,
        budget: Number(form.budget) || 0
      });
      notify("Request posted successfully!", "success");
      setShowModal(false);
      setForm({ title: "", description: "", budget: "" });
      fetchRequests();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to post request", "error");
    }
  };

  const handleRespond = async (requestId) => {
    if (!user) return navigate("/auth");
    try {
      const { data } = await api.post("/chats", { requestId });
      navigate(`/chats/${data._id}`);
    } catch (err) {
      notify(err.response?.data?.message || "Failed to start chat", "error");
    }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-ink">Request Board</h1>
            <p className="text-muted mt-1">Looking for something specific? Post it here so sellers can find you.</p>
          </div>
          <button 
            onClick={() => {
              if (!user) navigate("/auth");
              else setShowModal(true);
            }} 
            className="btn-primary"
          >
            <Plus size={18} /> Post a Request
          </button>
        </div>

        {/* Board */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 h-40 animate-pulse bg-elevated/50" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="card p-12 text-center text-muted flex flex-col items-center">
            <Search size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-bold text-ink">No active requests.</p>
            <p>Be the first to post what you're looking for!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div key={req._id} className="card p-6 flex flex-col justify-between hover:shadow-card-hover transition-all">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-ink line-clamp-2 leading-tight">{req.title}</h3>
                    {req.budget > 0 && (
                      <span className="badge badge-mint flex-shrink-0 whitespace-nowrap">
                        Budget: {formatPrice(req.budget)}
                      </span>
                    )}
                  </div>
                  {req.description && (
                    <p className="text-sm text-muted mt-3 line-clamp-3">{req.description}</p>
                  )}
                  
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center font-bold text-xs text-brand">
                      {req.requester?.name?.charAt(0)}
                    </div>
                    <div className="text-xs text-muted">
                      <span className="font-bold text-ink">{req.requester?.name}</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 font-bold text-[10px]">
                        Trust Score: {req.requester?.trustScore}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {user?._id === req.requester?._id ? (
                    <div className="w-full text-center text-xs font-bold text-muted p-2 rounded-xl bg-elevated">
                      Your Request
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleRespond(req._id)}
                      className="w-full btn-secondary flex items-center justify-center gap-2 border-brand/30 hover:bg-brand hover:text-white group"
                    >
                      <Sparkles size={16} className="text-brand group-hover:text-white" />
                      I have this!
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 animate-[slideIn_0.2s_ease-out]">
            <h2 className="text-xl font-black text-ink mb-1">Post a Request</h2>
            <p className="text-sm text-muted mb-6">Describe the item you are looking for.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Item Name <span className="text-coral">*</span></label>
                <input 
                  autoFocus
                  required
                  placeholder="e.g. Engineering Drawing Kit"
                  className="input"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea 
                  placeholder="Any specific edition, condition requirements, etc."
                  className="input resize-none"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Your Budget (₹)</label>
                <input 
                  type="number"
                  min="0"
                  placeholder="0"
                  className="input"
                  value={form.budget}
                  onChange={e => setForm({...form, budget: e.target.value})}
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default RequestsBoard;

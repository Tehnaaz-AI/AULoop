import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, MessageCircle, Send, Tag, ShieldCheck, Sparkles, Scan, X, QrCode, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { formatPrice } from "../utils/constants";
import { getSocket } from "../services/socket";
import PageTransition from "../components/PageTransition";

const ChatsPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { toast } = useUi();
  const [chats, setChats] = useState([]);
  const [active, setActive] = useState(null);
  const [body, setBody] = useState("");
  const [offer, setOffer] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showScanner, setShowScanner] = useState(false);

  const loadChats = async () => {
    try {
      const { data } = await api.get("/chats");
      setChats(data);
    } catch { /* silent */ }
    finally { setLoadingChats(false); }
  };

  useEffect(() => { loadChats(); }, []);

  const loadActive = async (silent = false) => {
    if (!id) return;
    try {
      const { data } = await api.get(`/chats/${id}`);
      setActive(data);
    } catch { if (!silent) setActive(null); }
  };

  useEffect(() => {
    loadActive();
    if (!token || !id) return;
    const socket = getSocket(token);

    socket.emit("chat:join", id);
    socket.emit("chat:read", { chatId: id });

    socket.on("message:new", ({ chatId, message }) => {
      if (chatId === id) {
        socket.emit("chat:read", { chatId: id });
      }
      setActive((prev) => {
        if (prev?._id === chatId) {
          const exists = prev.messages?.some((m) => m._id === message._id);
          if (exists) return prev;
          return { ...prev, messages: [...(prev.messages || []), message] };
        }
        return prev;
      });
      // Update the chat in sidebar list
      setChats((prev) =>
        prev.map((c) => {
          if (c._id === chatId) {
            return { ...c, messages: [...(c.messages || []), message], lastMessageAt: message.createdAt };
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt))
      );
    });

    socket.on("chat:updated", ({ chatId }) => {
      loadChats();
      if (chatId === id) loadActive(true);
    });

    socket.on("typing", ({ chatId, userId, isTyping }) => {
      if (chatId === id && userId !== user?._id) {
        setPartnerTyping(isTyping);
      }
    });

    socket.on("chat:read_receipt", ({ chatId, userId }) => {
      if (chatId !== id) return;
      setActive(prev => {
        if (!prev || prev._id !== chatId) return prev;
        return {
          ...prev,
          messages: prev.messages.map(m => 
            m.readBy?.includes(userId) ? m : { ...m, readBy: [...(m.readBy || []), userId] }
          )
        };
      });
    });

    return () => {
      socket.off("message:new");
      socket.off("chat:updated");
      socket.off("typing");
      socket.off("chat:read_receipt");
    };
  }, [id, token]);

  useEffect(() => {
    if (active?.handoverOtpExpires) {
      const updateTimer = () => {
        const diff = new Date(active.handoverOtpExpires) - new Date();
        setTimeLeft(Math.max(0, diff));
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [active?.handoverOtpExpires]);

  const handleScan = async (result) => {
    if (result && result[0]?.rawValue) {
       const scannedOtp = result[0].rawValue;
       setShowScanner(false);
       try {
         await api.patch(`/listings/${active.listing._id}/status`, { status: "sold", otp: scannedOtp, userId: active.buyer._id });
         toast("Sale completed securely via QR!", "success");
         loadActive(true);
       } catch (err) {
         toast(err.response?.data?.message || "Failed to mark as sold", "error");
       }
    }
  };

  const send = async () => {
    if ((!body.trim() && !offer) || !active?._id || sending || !token) return;
    setSending(true);
    try {
      const socket = getSocket(token);
      socket.emit("typing", { chatId: active._id, isTyping: false });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      await new Promise((resolve, reject) => {
        socket.emit("message:send", { chatId: active._id, body, offer: offer ? { amount: Number(offer) } : undefined }, (ack) => {
          if (ack?.ok) resolve(ack.message);
          else reject(new Error(ack?.error || "Failed to send message"));
        });
      });
      setBody("");
      setOffer("");
      loadChats();
    } catch (err) {
      toast(err.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const generateOtp = async () => {
    try {
      const { data } = await api.post(`/chats/${active._id}/generate-otp`);
      setActive((prev) => ({ ...prev, handoverOtp: data.otp, handoverOtpExpires: data.expires }));
      toast("Secure Handover OTP generated!", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to generate OTP", "error");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const getOther = (chat) => chat.buyer?._id === user?._id ? chat.seller : chat.buyer;
  const initials = (name) => name ? name.slice(0, 2).toUpperCase() : "?";
  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr);
    if (diff < 60000) return "now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <PageTransition>
      <div className="flex h-[calc(100dvh-6.5rem)] sm:h-[calc(100vh-6.5rem)] min-h-[450px] sm:min-h-[500px] overflow-hidden rounded-[2rem] border border-white/50 glass-3d backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] max-w-6xl mx-auto mt-2">

        {/* ── Sidebar ── */}
        <aside className={`flex flex-col border-r border-white/30 bg-white/30 backdrop-blur-md transition-all ${id ? "hidden lg:flex lg:w-80 xl:w-96" : "flex w-full lg:w-80 xl:w-96"}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/30">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <MessageCircle size={16} />
              </div>
              <h1 className="text-lg font-black text-ink">Messages</h1>
            </div>
            <span className="badge badge-brand">{chats.length}</span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide">
            {loadingChats ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl animate-pulse bg-white/40">
                    <div className="h-12 w-12 rounded-full bg-white/60 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/60 rounded-full w-3/4" />
                      <div className="h-2.5 bg-white/60 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-white/50 flex items-center justify-center mb-4 text-brand/30 shadow-inner">
                  <MessageCircle size={28} />
                </div>
                <p className="text-sm font-black text-ink">No conversations</p>
                <p className="text-xs text-muted mt-1 max-w-[200px]">Start negotiating from any campus listing.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => {
                  const other = getOther(chat);
                  const isActive = id === chat._id;
                  const lastMsg = chat.messages?.[chat.messages.length - 1];
                  return (
                    <Link
                      key={chat._id}
                      to={`/chats/${chat._id}`}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                        isActive 
                          ? "bg-gradient-to-r from-brand/15 to-brand/5 shadow-sm border-l-4 border-l-brand" 
                          : "hover:bg-white/60 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black shadow-inner transition-colors duration-300 ${isActive ? "bg-brand text-white shadow-brand/30" : "bg-white text-muted group-hover:text-brand"}`}>
                        {initials(other?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-sm font-bold truncate transition-colors duration-300 ${isActive ? "text-brand" : "text-ink group-hover:text-brand"}`}>
                            {other?.name || "Student"}
                          </p>
                          {lastMsg?.createdAt && (
                            <span className="text-[10px] font-bold text-muted/80 flex-shrink-0">{timeAgo(lastMsg.createdAt)}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted truncate">{chat.listing?.title || chat.itemRequest?.title || "Listing"}</p>
                      </div>
                      <ChevronRight size={14} className={`flex-shrink-0 transition-all duration-300 ${isActive ? "text-brand translate-x-0 opacity-100" : "text-slate-400 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── Chat panel ── */}
        <section className={`flex flex-col flex-1 min-w-0 bg-white/40 ${!id ? "hidden lg:flex" : "flex"}`}>
          {active ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/40 bg-white/30 backdrop-blur-sm z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <Link to="/chats" className="lg:hidden p-2 rounded-xl bg-white/50 hover:bg-white text-ink transition-colors shadow-sm">
                  <ArrowLeft size={18} />
                </Link>
                <div className="h-11 w-11 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black bg-gradient-to-br from-brand to-accent text-white shadow-lg shadow-brand/20">
                  {initials(active.buyer?._id === user?._id ? active.seller?.name : active.buyer?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-ink truncate">
                    {active.buyer?._id === user?._id ? active.seller?.name : active.buyer?.name}
                  </p>
                  <div className="text-xs truncate flex items-center gap-1.5 mt-0.5">
                    {partnerTyping ? (
                      <span className="text-brand font-black animate-pulse flex items-center gap-1"><Sparkles size={10} /> typing...</span>
                    ) : (
                      <>
                        <span className="text-muted font-bold truncate max-w-[200px]">
                          {active.listing?.title || active.itemRequest?.title}
                        </span>
                        {active.listing?.price && <span className="text-brand font-black bg-brand/10 px-1.5 rounded">₹{active.listing.price}</span>}
                        {active.itemRequest?.budget > 0 && <span className="text-brand font-black bg-brand/10 px-1.5 rounded">₹{active.itemRequest.budget}</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {active.buyer?._id === user?._id && active.listing?.status !== "sold" && (
                    <div className="relative group flex items-center justify-center">
                      {active.handoverOtp && timeLeft > 0 ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-sm relative overflow-visible cursor-pointer">
                          <div className="relative w-6 h-6 flex items-center justify-center">
                             <svg className="w-6 h-6 transform -rotate-90">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-emerald-500/20" />
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-emerald-500 transition-all duration-1000 ease-linear" strokeDasharray="62.83" strokeDashoffset={62.83 - (timeLeft / (3 * 60 * 1000)) * 62.83} strokeLinecap="round" />
                             </svg>
                             <span className="absolute text-[8px] font-black text-emerald-700">{Math.ceil(timeLeft / 1000)}s</span>
                          </div>
                          <span className="font-mono font-black text-emerald-700 tracking-widest text-sm">{active.handoverOtp}</span>

                          <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all bg-white p-3 rounded-2xl shadow-xl border border-border/60 z-50 transform scale-95 group-hover:scale-100 origin-top-right">
                             <p className="text-[10px] font-bold text-center text-muted mb-2 uppercase tracking-widest">Show to seller</p>
                             <div className="bg-white p-2 rounded-xl">
                               <QRCodeSVG value={active.handoverOtp} size={120} level="H" includeMargin={false} />
                             </div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={generateOtp} className="btn-secondary bg-white/60 hover:bg-white text-xs px-3 py-1.5 shadow-sm flex items-center gap-1.5 rounded-xl border border-white/50 font-bold" title="Generate OTP for secure handover">
                          <ShieldCheck size={14} className="text-emerald-600" /> {active.handoverOtp ? "Expired. New Code" : "Secure Receive"}
                        </button>
                      )}
                    </div>
                  )}

                  {active.seller?._id === user?._id && active.listing?.status !== "sold" && (
                    <div>
                      <button onClick={() => setShowScanner(!showScanner)} className="btn-secondary bg-white/60 hover:bg-brand hover:text-white text-[11px] px-3 py-1.5 shadow-sm flex items-center gap-1 rounded-xl border border-white/50 font-bold transition-all whitespace-nowrap">
                        <QrCode size={14} /> Scan & Sell
                      </button>
                    </div>
                  )}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${active.listing?.status === "sold" ? "bg-coral text-white" : "bg-emerald-500 text-white"}`}>
                    {active.listing?.status || "active"}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col-reverse gap-3 scrollbar-hide relative">
                {showScanner && (
                  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-b-[2rem] overflow-hidden animate-[fadeIn_0.3s_ease-out]">
                     <button onClick={() => setShowScanner(false)} className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[60]">
                        <X size={20} />
                     </button>
                     <div className="w-full max-w-[280px] aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative">
                       <Scanner onScan={handleScan} />
                       <div className="absolute inset-0 border-[6px] border-emerald-500/50 rounded-3xl pointer-events-none"></div>
                     </div>
                     <p className="text-white font-bold mt-6 flex items-center gap-2"><Scan size={18} /> Scan buyer's QR code to verify sale</p>
                  </div>
                )}
                {(active.messages || []).length === 0 && (
                  <div className="flex flex-col flex-1 items-center justify-center text-center py-12">
                    <div className="h-20 w-20 rounded-full bg-white/60 flex items-center justify-center mb-4 shadow-sm">
                      <MessageCircle size={32} className="text-brand/50" />
                    </div>
                    <p className="text-base font-black text-ink mb-1">It's quiet here</p>
                    <p className="text-sm text-muted max-w-[250px]">Send a friendly message or make an offer to start the deal.</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {[...(active.messages || [])].reverse().map((msg, idx, arr) => {
                    const originalIdx = arr.length - 1 - idx;
                    const mine = msg.sender?._id === user?._id || msg.sender === user?._id;
                    const showAvatar = !mine && (originalIdx === 0 || active.messages[originalIdx - 1]?.sender?._id !== msg.sender?._id);
                    
                    return (
                      <motion.div 
                        key={msg._id || idx}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`flex items-end gap-2.5 ${mine ? "justify-end" : "justify-start"}`}
                      >
                        {!mine && (
                          <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black shadow-inner transition-opacity duration-300 ${showAvatar ? "bg-white text-brand opacity-100" : "opacity-0"}`}>
                            {initials(active.buyer?._id === user?._id ? active.seller?.name : active.buyer?.name)}
                          </div>
                        )}
                        <div className={`max-w-[75%] sm:max-w-md flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
                          {msg.offer?.amount && (
                            <div className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-700 border border-amber-400/30 backdrop-blur-md mb-0.5 shadow-sm">
                              <Tag size={12} /> Offer: ₹{msg.offer.amount}
                            </div>
                          )}
                          <div className={`px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm ${
                            mine 
                              ? "bg-gradient-to-br from-brand to-accent text-white rounded-2xl rounded-br-sm shadow-brand/20" 
                              : "bg-white/80 backdrop-blur-xl text-ink border border-white rounded-2xl rounded-bl-sm"
                          }`}>
                            {msg.body}
                          </div>
                          {msg.createdAt && (
                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${mine ? "justify-end" : "justify-start"} w-full`}>
                              <span className={`text-[9px] font-bold ${mine ? "text-brand-100/80 text-white/70" : "text-muted/60"}`}>{timeAgo(msg.createdAt)}</span>
                              {mine && (
                                msg.readBy && msg.readBy.length > 1 
                                  ? <CheckCheck size={12} className="text-white" />
                                  : <Check size={12} className="text-white/60" />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {partnerTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex items-end gap-2.5 justify-start mb-2"
                  >
                    <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black bg-white text-brand shadow-inner">
                      {initials(active.buyer?._id === user?._id ? active.seller?.name : active.buyer?.name)}
                    </div>
                    <div className="px-4 py-3 bg-white/80 backdrop-blur-xl border border-white rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 bg-brand rounded-full animate-bounce"></span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input bar */}
              <div className="p-4 sm:p-6 bg-transparent">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/70 backdrop-blur-xl border border-white/80 p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="relative group flex-shrink-0 w-24 sm:w-28">
                    <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" />
                    <input
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                      placeholder="Offer"
                      type="number"
                      className="w-full rounded-full bg-white/50 pl-9 pr-3 py-2.5 text-sm font-bold text-ink placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                    />
                  </div>
                  
                  <div className="h-8 w-px bg-slate-200/60 hidden sm:block"></div>

                  <input
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      if (token && id && e.target.value.trim()) {
                        const socket = getSocket(token);
                        socket.emit("typing", { chatId: id, isTyping: true });
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                          socket.emit("typing", { chatId: id, isTyping: false });
                        }, 2000);
                      }
                    }}
                    onKeyDown={handleKey}
                    placeholder="Type a message…"
                    className="flex-1 rounded-full bg-white/50 px-5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                  />
                  <button
                    disabled={sending || (!body.trim() && !offer)}
                    onClick={send}
                    className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full bg-brand text-white transition-all hover:bg-accent hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed group"
                  >
                    {sending
                      ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      : <Send size={16} className="ml-0.5 group-hover:scale-110 transition-transform" />
                    }
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center p-8 text-center bg-white/20">
              <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-brand/10 to-accent/5 border border-white/40 flex items-center justify-center mb-6 shadow-sm">
                <MessageCircle size={40} className="text-brand/60" />
              </div>
              <p className="font-black text-ink text-2xl mb-2">Campus Messages</p>
              <p className="text-sm font-semibold text-muted max-w-xs leading-relaxed">
                Select an active conversation from the sidebar or start a new one from any listing.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default ChatsPage;

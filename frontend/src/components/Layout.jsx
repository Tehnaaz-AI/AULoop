import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell, LayoutDashboard, LogOut, MessageCircle,
  Plus, Search, Shield, ShoppingBag, UserRound, Sun, Moon, Home, Video, HeartHandshake, Download
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";
import { useStore } from "../store/useStore";
import Toast from "./Toast";
import Footer from "./Footer";
import CursorGlow from "./CursorGlow";

const navLink = ({ isActive }) =>
  `relative flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-bold transition-all duration-300 group overflow-hidden ${
    isActive
      ? "text-white bg-gradient-to-r from-brand to-accent shadow-md shadow-brand/20"
      : "text-muted hover:text-ink hover:bg-brand/10 hover:shadow-sm"
  }`;

const Layout = () => {
  const { user, logout } = useAuth();
  const { notice, setNotice, notifications, setNewNotifications, setNotifications } = useUi();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { theme, toggleTheme } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/auth"); };

  const search = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/marketplace?q=${encodeURIComponent(q.trim())}` : "/marketplace");
  };

  return (
    <div className="min-h-screen bg-transparent">
      <CursorGlow />
      <Toast message={notice?.message} type={notice?.type} onClose={() => setNotice(null)} />

      <div className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 transition-all duration-300 animate-[slideUp_0.5s_ease-out]">
        <header className="mx-auto flex max-w-7xl flex-col gap-3 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(13,148,136,0.15)] transition-all duration-500 overflow-hidden">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <img src={theme === "dark" ? "/logo-dark.jpg" : "/logo-light.png"} alt="AULoop Logo" className="h-14 w-14 object-contain drop-shadow-sm group-hover:scale-105 transition-all duration-300 rounded-full" />
              <div className="hidden sm:block">
                <span className="block text-lg font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand to-accent group-hover:opacity-80 transition-opacity">AULoop</span>
                <span className="block text-[10px] font-bold text-brand leading-tight uppercase tracking-widest opacity-80">Verified Resale</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-0.5 bg-elevated/70 p-1 rounded-[12px] border border-border/60 shadow-inner flex-shrink min-w-0 overflow-x-auto hide-scrollbar">
              <NavLink to="/" className={navLink} end><Home size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Home</span></NavLink>
              <NavLink to="/marketplace" className={navLink}><ShoppingBag size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Market</span></NavLink>
              <NavLink to="/campus-radar" className={navLink}><Search size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Radar</span></NavLink>
              <NavLink to="/requests" className={navLink}><HeartHandshake size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Requests</span></NavLink>
              <NavLink to="/reels" className={navLink}><Video size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Reels</span></NavLink>
              {user && (
                <>
                  <NavLink to="/sell" className={navLink}><Plus size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Sell</span></NavLink>
                  <NavLink to="/chats" className={navLink}><MessageCircle size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Chats</span></NavLink>
                  <NavLink to="/dashboard" className={navLink}><LayoutDashboard size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Dashboard</span></NavLink>
                </>
              )}
              {user?.role === "admin" && (
                <NavLink to="/admin" className={navLink}><Shield size={14} className="transition-transform group-hover:scale-110 flex-shrink-0" /> <span className="whitespace-nowrap">Admin</span></NavLink>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Install App Button */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="hidden xl:flex h-10 px-4 items-center gap-2 rounded-[14px] bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 transition-all animate-[fadeIn_0.5s_ease-out]"
                  aria-label="Install App"
                >
                  <Download size={16} /> Install App
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="h-10 w-10 flex items-center justify-center rounded-[14px] border border-border/60 bg-elevated/50 text-muted hover:text-brand hover:border-brand/40 hover:bg-brand/5 hover:shadow-glow transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Search */}
              <form onSubmit={search} className="hidden xl:flex items-center gap-2 rounded-[14px] border border-border/60 bg-elevated/50 px-4 py-2 shadow-inner transition-all focus-within:border-brand focus-within:bg-card focus-within:shadow-glow focus-within:-translate-y-0.5">
                <Search size={16} className="text-muted flex-shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search..."
                  className="w-24 border-0 bg-transparent text-[13px] font-semibold outline-none placeholder:text-muted/70 text-ink transition-all focus:w-36 2xl:w-36 2xl:focus:w-48"
                />
              </form>

              {/* Notifications */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => {
                      navigate("/notifications");
                      setNewNotifications(false);
                      setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
                    }}
                    className="relative h-10 w-10 flex items-center justify-center rounded-[14px] border border-border/60 bg-elevated/50 text-muted hover:text-brand hover:border-brand/40 hover:bg-brand/5 hover:shadow-glow transition-all"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {(() => {
                      const newCount = notifications.filter(n => n.isNew).length;
                      if (newCount > 0) {
                        return (
                          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-black text-white bg-coral shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-[bounce-soft_1.5s_ease-in-out_infinite]">
                            {newCount > 9 ? "9+" : newCount}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </button>
                </div>
              )}

              {/* User */}
              {user ? (
                <>
                  <Link to="/profile" className="hidden xl:flex flex-shrink-0 items-center justify-center rounded-[12px] border border-border/60 bg-elevated/50 p-1.5 hover:border-brand/40 hover:text-brand hover:bg-brand/5 hover:shadow-glow transition-all" title="Profile">
                    {user.avatar?.url
                      ? <img src={user.avatar.url} alt="" className="h-7 w-7 rounded-[8px] object-cover shadow-sm flex-shrink-0" />
                      : <div className="h-7 w-7 rounded-[8px] bg-brand/10 flex items-center justify-center text-brand flex-shrink-0"><UserRound size={14} /></div>
                    }
                  </Link>
                  <button onClick={handleLogout} className="hidden xl:flex flex-shrink-0 items-center justify-center h-10 w-10 min-w-[40px] rounded-[14px] bg-coral/10 border border-coral/20 text-coral hover:bg-coral hover:text-white hover:shadow-glow transition-all" title="Log out">
                    <LogOut size={16} />
                  </button>
                </>
              ) : (
                <Link to="/auth" className="rounded-[14px] bg-gradient-to-r from-brand to-accent px-5 py-2.5 text-sm font-black text-white hover:shadow-[0_0_20px_rgba(13,148,136,0.4)] transition-all hover:-translate-y-0.5 btn-shimmer">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search & Nav */}
          <div className="xl:hidden flex flex-col gap-2 pb-3 px-3">
            <form onSubmit={search} className="flex items-center gap-2 rounded-xl border border-border/60 bg-elevated/50 px-4 py-2.5 shadow-inner focus-within:border-brand focus-within:bg-card focus-within:shadow-glow transition-all">
              <Search size={16} className="text-muted flex-shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search campus listings..."
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-muted/70 text-ink"
              />
            </form>
            <nav className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
              <NavLink to="/" className={navLink} end>Home</NavLink>
              <NavLink to="/marketplace" className={navLink}>Market</NavLink>
              <NavLink to="/campus-radar" className={navLink} onClick={() => window.scrollTo(0, 0)}><Search size={14} /> Radar</NavLink>
              <NavLink to="/requests" className={navLink} onClick={() => window.scrollTo(0, 0)}><HeartHandshake size={14} /> Requests</NavLink>
              <NavLink to="/reels" className={navLink} onClick={() => window.scrollTo(0, 0)}><Video size={14} /> Reels</NavLink>
              {user && (
                <>
                  <NavLink to="/sell" className={navLink}>Sell</NavLink>
                  <NavLink to="/chats" className={navLink}>Chats</NavLink>
                  <NavLink to="/dashboard" className={navLink}>Dashboard</NavLink>
                  <NavLink to="/profile" className={navLink}>Profile</NavLink>
                </>
              )}
              {user?.role === "admin" && <NavLink to="/admin" className={navLink}>Admin</NavLink>}
              {deferredPrompt && (
                <button onClick={handleInstallClick} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-all flex-shrink-0">
                  <Download size={14} /> Install App
                </button>
              )}
              {user && (
                <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-coral bg-coral/10 hover:bg-coral/20 transition-all flex-shrink-0">
                  <LogOut size={14} /> Logout
                </button>
              )}
            </nav>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:py-7 animate-[fadeIn_0.3s_ease-out]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

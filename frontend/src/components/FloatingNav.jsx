import { Link, NavLink } from "react-router-dom";
import { Bell, Heart, Home, MessageCircle, Plus, ShieldCheck, UserRound, Video } from "lucide-react";
import { useStore } from "../store/useStore.js";

const links = [
  { to: "/marketplace", label: "Market", icon: Home },
  { to: "/reels", label: "Reels", icon: Video },
  { to: "/add", label: "Sell", icon: Plus },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/saved", label: "Saved", icon: Heart }
];

export default function FloatingNav() {
  return (
    <header className="fixed left-1/2 top-4 z-50 w-[min(1120px,calc(100%-24px))] -translate-x-1/2">
      <nav className="glass flex h-16 items-center justify-between rounded-full px-3 shadow-soft bg-white/85 backdrop-blur">
        <Link to="/" className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-extrabold tracking-tight group">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-mint to-ink text-white group-hover:shadow-lg transition">
            <ShieldCheck size={20} />
          </span>
          <span className="hidden sm:inline text-ink">Campus Resell</span>
        </Link>
        <div className="flex max-w-[60%] items-center gap-1 overflow-x-scroll rounded-full bg-white/30 p-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                  isActive ? "bg-ink text-white shadow-md" : "text-ink/60 hover:bg-white hover:text-ink"
                }`
              }
              title={label}
            >
              <Icon size={18} />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Link title="Notifications" to="/notifications" className="grid h-11 w-11 place-items-center rounded-full text-ink/60 hover:bg-white hover:text-ink transition">
            <Bell size={18} />
          </Link>
          <Link title="Profile" to="/profile" className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-mint to-ink text-white hover:shadow-lg transition">
            <UserRound size={18} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

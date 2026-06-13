import { Link } from "react-router-dom";
import { ShieldCheck, MapPin, MessageCircle, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-brand/10 bg-elevated/30">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-brand/5 rounded-[100%] blur-[80px] pointer-events-none" />

      <div className="page-shell relative z-10 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group inline-flex">
              <div className="h-12 w-12 rounded-[14px] bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:scale-105 group-hover:rotate-6">
                <Sparkles size={24} />
              </div>
              <div>
                <span className="block text-2xl font-black text-ink tracking-tight group-hover:text-brand transition-colors">
                  AULoop
                </span>
                <span className="block text-[11px] font-bold text-brand uppercase tracking-[0.2em] opacity-90">
                  Verified Resale
                </span>
              </div>
            </Link>
            <p className="text-muted leading-relaxed max-w-md font-medium text-sm">
              The safest and easiest way to buy and sell within your university
              campus. Verified students only, real-time chat, and trusted
              listings guaranteed.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-ink bg-brand/10 px-3 py-1.5 rounded-lg border border-brand/20">
                <ShieldCheck size={14} className="text-brand" />
                Verified
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-ink bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                <MapPin size={14} className="text-success" />
                Campus Only
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand" /> Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Explore Marketplace", path: "/marketplace" },
                { label: "Campus Radar", path: "/campus-radar" },
                { label: "Sell an Item", path: "/sell" },
                { label: "Saved Listings", path: "/saved" },
                { label: "My Dashboard", path: "/dashboard" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-sm font-semibold text-muted hover:text-brand hover:translate-x-1 inline-block transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" /> Trust & Safety
            </h3>
            <ul className="space-y-3">
              {[
                "Verified student accounts",
                "In-app reports",
                "Campus pickup guidance",
                "Seller ratings",
              ].map((item) => (
                <li key={item}>
                  <Link to="/trust" className="text-sm font-semibold text-muted hover:text-accent hover:translate-x-1 inline-block transition-all">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Campus */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-info" /> Community
            </h3>
            <ul className="space-y-3">
              {[
                "Anurag University",
                "Student Verified",
                "Safe Transactions",
                "About Us",
              ].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-sm font-semibold text-muted hover:text-info hover:translate-x-1 inline-block transition-all">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-semibold text-muted">
            &copy; {new Date().getFullYear()} AULoop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: "Twitter", path: "https://twitter.com" },
              { label: "Instagram", path: "https://instagram.com" },
              { label: "LinkedIn", path: "https://linkedin.com" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.path}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold text-muted hover:text-brand hover:border-brand/40 hover:shadow-sm transition-all"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import { ShieldCheck, Flag, MapPin, Star } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function TrustPage() {
  return (
    <PageTransition className="page-shell max-w-4xl py-12">
      <div className="text-center mb-16">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-accent text-white shadow-glow mb-6">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-5xl font-black text-ink mb-4 tracking-tight">Trust & Safety</h1>
        <p className="text-xl text-muted max-w-2xl mx-auto font-medium">
          AULoop is built exclusively for university students. We take your safety seriously.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-8 group hover:border-brand/30 transition-all">
          <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-2xl font-black text-ink mb-3">Verified Student Accounts</h2>
          <p className="text-muted leading-relaxed">
            Every user on AULoop must verify their academic email address. We strictly prohibit external users from joining to ensure all transactions happen within our trusted campus community.
          </p>
        </div>

        <div className="card p-8 group hover:border-brand/30 transition-all">
          <div className="h-12 w-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Flag size={24} />
          </div>
          <h2 className="text-2xl font-black text-ink mb-3">In-app Reports</h2>
          <p className="text-muted leading-relaxed">
            Spot a fake listing? See suspicious behavior? Use our in-app reporting system on any listing or chat. Our moderation team reviews all reports within 24 hours to keep the community clean.
          </p>
        </div>

        <div className="card p-8 group hover:border-brand/30 transition-all">
          <div className="h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MapPin size={24} />
          </div>
          <h2 className="text-2xl font-black text-ink mb-3">Campus Pickup Guidance</h2>
          <p className="text-muted leading-relaxed">
            We highly recommend meeting at well-lit, populated campus locations. During negotiations, sellers can select verified safe zones like the Library, Cafeteria, or Student Center to complete the exchange.
          </p>
        </div>

        <div className="card p-8 group hover:border-brand/30 transition-all">
          <div className="h-12 w-12 rounded-xl bg-sun/10 text-sun flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Star size={24} />
          </div>
          <h2 className="text-2xl font-black text-ink mb-3">Seller Ratings</h2>
          <p className="text-muted leading-relaxed">
            Buy with confidence. Every completed transaction unlocks the ability to leave a verified rating and review. Check a seller's Trust Score before reaching out to ensure a smooth experience.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}

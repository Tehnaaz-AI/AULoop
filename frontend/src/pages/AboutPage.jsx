import { GraduationCap, Users, ShieldCheck } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <PageTransition className="page-shell max-w-4xl py-12">
      <div className="text-center mb-16">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-accent text-white shadow-glow mb-6">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-5xl font-black text-ink mb-4 tracking-tight">About AULoop</h1>
        <p className="text-xl text-muted max-w-2xl mx-auto font-medium">
          A dedicated marketplace connecting students at Anurag University to buy, sell, and discover items safely.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="card p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
            <GraduationCap size={20} />
          </div>
          <h3 className="font-black text-ink text-lg mb-2">Anurag University</h3>
          <p className="text-sm text-muted">Exclusively serving the Anurag University community. Built for students, by students.</p>
        </div>
        
        <div className="card p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-success/10 text-success flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <h3 className="font-black text-ink text-lg mb-2">Student Verified</h3>
          <p className="text-sm text-muted">Every account is verified using official university credentials to maintain a trusted environment.</p>
        </div>

        <div className="card p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-info/10 text-info flex items-center justify-center mb-4">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-black text-ink text-lg mb-2">Safe Transactions</h3>
          <p className="text-sm text-muted">Meet on campus, chat securely in-app, and rely on our robust Trust Score system.</p>
        </div>
      </div>

      <div className="rounded-3xl app-gradient-panel p-10 text-center text-white shadow-xl">
        <h2 className="text-3xl font-black mb-4">Join the AULoop Community</h2>
        <p className="text-white/80 font-medium mb-8 max-w-lg mx-auto">
          Clear out your dorm room, find affordable textbooks, and connect with fellow students today.
        </p>
        <Link to="/marketplace" className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-black text-brand shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all">
          Explore Marketplace
        </Link>
      </div>
    </PageTransition>
  );
}

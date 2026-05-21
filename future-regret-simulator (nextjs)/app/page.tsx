"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const steps = [
  { number: "01", title: "Answer 50 questions", description: "Rate yourself honestly on habits, discipline, risk appetite, and life priorities." },
  { number: "02", title: "Run the simulation", description: "Our model projects 3 divergent futures based on your current trajectory." },
  { number: "03", title: "See your regret score", description: "Visualize the gap between who you are now and who you could become." },
];

const features = [
  { icon: "◎", title: "Decision Simulator", description: "Tweak sliders in real-time and watch your future change instantly." },
  { icon: "△", title: "Growth Projections", description: "See your skill curve, income trajectory, and life satisfaction over 5 years." },
  { icon: "◈", title: "Regret Breakdown", description: "Understand exactly what's dragging your future down — and fix it." },
  { icon: "⊞", title: "Milestone Timeline", description: "Year 1, 3, and 5 checkpoints showing the defining moments ahead." },
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-primary)" }}>
      <Navbar />


      <section className="max-w-3xl w-full mx-auto px-4 md:px-6 pt-20 md:pt-28 max-md:overflow-hidden" style={{ paddingBottom: 80, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 600, height: 300, background: "radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="animate-fade-up">
          <span style={{ display: "inline-block", background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 48 }}>
            Decisions have consequences
          </span>
        </div>
        <h1 className="animate-fade-up delay-100" style={{ fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 32, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
          See your future<br />
          <span style={{ color: "var(--accent)" }}>before you live it</span>
        </h1>
        <p className="animate-fade-up delay-200" style={{ fontSize: "clamp(15px, 4vw, 18px)", color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto 52px", fontWeight: 300, lineHeight: 1.7 }}>
          Simulate your decisions. Visualize 3 possible futures. Avoid the regret you can still prevent.
        </p>
        <div className="animate-fade-up delay-300" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="accent-pulse" style={{ background: "var(--accent)", color: "#0B0F14", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Syne, sans-serif", letterSpacing: "-0.01em" }}>
              Start Simulation →
            </button>
          </Link>
        </div>
        <div className="animate-fade-up delay-400 flex justify-center flex-wrap gap-6 md:gap-20 mt-12">
          {[{ value: "3", label: "Future scenarios" }, { value: "50", label: "Life variables" }, { value: "5yr", label: "Projection window" }].map(stat => (
            <div key={stat.label} style={{ textAlign: "center", minWidth: 120 }} className="max-md:w-full max-md:flex max-md:flex-col max-md:items-center">
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne, sans-serif", letterSpacing: "-0.04em" }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-disabled)", marginTop: 10, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>


      <section className="max-w-4xl w-full mx-auto px-4 md:px-5 border-t border-[var(--border)] max-md:overflow-hidden" style={{ marginTop: 40, paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }} className="max-md:mb-12">
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Process</span>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, color: "var(--text-primary)", marginTop: 16, letterSpacing: "-0.02em" }}>How it works</h2>
        </div>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
            {steps.map((step, i) => (
              <div key={step.number} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, position: "relative", overflow: "hidden", marginTop: 16 }}>
                <div style={{ position: "absolute", top: -12, right: 20, fontSize: 80, fontWeight: 900, color: "rgba(55,65,81,0.4)", fontFamily: "Syne, sans-serif", lineHeight: 1, pointerEvents: "none" }}>{step.number}</div>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-dim)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 14, fontWeight: 700, color: "var(--accent)", fontFamily: "Syne, sans-serif" }}>{i + 1}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="max-w-4xl w-full mx-auto px-4 md:px-6 border-t border-[var(--border)] max-md:overflow-hidden" style={{ marginTop: 40, paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }} className="max-md:mb-10">
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Features</span>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, color: "var(--text-primary)", marginTop: 10, letterSpacing: "-0.02em" }}>What you will discover</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 mx-auto" style={{ gap: 20, maxWidth: 720, margin: "0 auto" }}>
          {features.map(f => (
            <div key={f.title} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 28, transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(34,197,94,0.25)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <span style={{ fontSize: 24, display: "block", marginBottom: 14, color: "var(--accent)" }}>{f.icon}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="max-w-4xl w-full mx-auto px-4 md:px-6 border-t border-[var(--border)] max-md:overflow-hidden" style={{ marginTop: 40, paddingTop: 96, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }} className="max-md:mb-8">
          <h2 style={{ fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", paddingTop: 16 }}>Your future, branching now</h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginTop: 12 }}>Every decision creates a fork. Here is what the divergence looks like.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 mx-auto" style={{ gap: 16, maxWidth: 860, margin: "0 auto" }}>
          {[
            { label: "Best case", regret: 12, color: "#22C55E", desc: "You take action. Habits compound. Growth accelerates." },
            { label: "Middle path", regret: 41, color: "#EAB308", desc: "You stay comfortable. Slow growth. Moderate regret." },
            { label: "Drift path", regret: 78, color: "#EF4444", desc: "Inaction dominates. Opportunities slip. Regret builds." },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg-card)", border: `1px solid ${s.color}30`, borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "Syne, sans-serif" }}>{s.regret}%</span>
              </div>
              <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.regret}%`, background: s.color, borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="w-full px-4 md:px-6 py-20 md:py-24 pb-24 md:pb-28 text-center max-md:overflow-hidden" style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <div className="rounded-xl border p-6 md:p-8 max-md:w-full" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", maxWidth: 560, margin: "0 auto", width: "100%" }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "12px 0 8px" }}>Your data stays yours</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>No personal data is sold or shared. Simulations are stored locally and associated only with your account. We do not use your responses for training or advertising.</p>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] w-full text-center" style={{ marginTop: 48, padding: "32px 24px", color: "var(--text-disabled)", fontSize: 12 }}>
        © 2026 Future Regret Simulator — Simulate your decisions. Avoid regret.
      </footer>
    </div>
  );
}

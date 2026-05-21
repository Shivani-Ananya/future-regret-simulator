"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui";
import Link from "next/link";
import { runRegretEngine, RegretEngineOutput } from "@/lib/regretEngine";
import {
  TrendingUp, TrendingDown, Minus,
  Zap, Brain, Flame, Star,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────
const pct = (v: number) => `${Math.round(v * 100)}%`;
const bar = (v: number, color: string) => (
  <div style={{ height: 8, background: "var(--bg-primary)", borderRadius: 4, overflow: "hidden", flex: 1 }}>
    <div style={{ height: "100%", width: `${Math.round(v * 100)}%`, background: color, borderRadius: 4, transition: "width 0.7s ease-out" }} />
  </div>
);

function RiskRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{pct(value)}</span>
      </div>
      <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.round(value * 100)}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 13, color: "var(--text-primary)", opacity: 0.9, lineHeight: 1.5 }}>{sub}</span>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────
export default function SimulationPage() {
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<RegretEngineOutput | null>(null);
  const [adjEffort, setAdjEffort] = useState(0);
  const [adjDiscipline, setAdjDiscipline] = useState(0);
  const [adjConsistency, setAdjConsistency] = useState(0);

  const [pngStatus, setPngStatus]       = useState<"idle" | "working">("idle");
  const [pdfStatus, setPdfStatus]       = useState<"idle" | "working">("idle");

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const saved = localStorage.getItem("frs_answers");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const out = runRegretEngine({
          sliders: data.sliders ?? {},
          timeInMonths: data.timeInMonths ?? 60,
          previousFailureMemory: data.previousFailureMemory ?? 0,
          current30DayAverage: data.current30DayAverage ?? 0.5,
          previous30DayAverage: data.previous30DayAverage ?? 0.5,
        });
        setTimeout(() => setResult(out), 0);
      } catch {
        // Silently fail for corrupted storage
      }
    }
  }, []);

  // Interactive "what if" simulator
  const simResult = useMemo(() => {
    if (!result) return null;
    const saved = localStorage.getItem("frs_answers");
    if (!saved) return null;
    try {
      const data = JSON.parse(saved);
      const s = { ...(data.sliders ?? {}) };
      // Apply adjustments: effort → study hrs, deep work; discipline → d1–d3; consistency → p7, d3
      const effortDelta = adjEffort / 100;
      const discDelta   = adjDiscipline / 100;
      const consDelta   = adjConsistency / 100;

      // Nudge relevant normalized inputs via raw-value offsets
      const nudge = (id: string, delta: number, min: number, max: number) => {
        s[id] = Math.max(min, Math.min(max, (s[id] ?? (min + max) / 2) + delta * (max - min)));
      };
      nudge("g1", effortDelta, 0, 12);
      nudge("g2", effortDelta, 0, 6);
      nudge("g3", effortDelta, 0, 100);
      nudge("g7", effortDelta, 1, 10);
      nudge("d1", discDelta, 1, 10);
      nudge("d2", discDelta, 1, 10);
      nudge("d5", discDelta, 1, 10);
      nudge("d6", discDelta, 1, 10);
      nudge("d3", consDelta, 1, 10);
      nudge("p7", consDelta, 1, 10);
      nudge("d7", consDelta, 1, 10);

      return runRegretEngine({
        sliders: s,
        timeInMonths: data.timeInMonths ?? 60,
        previousFailureMemory: data.previousFailureMemory ?? 0,
        current30DayAverage: data.current30DayAverage ?? 0.5,
        previous30DayAverage: data.previous30DayAverage ?? 0.5,
      });
    } catch { return null; }
  }, [result, adjEffort, adjDiscipline, adjConsistency]);

  // ─── CSS variable map (mirrors globals.css :root) ──────────────────────────
  const CSS_VARS: Record<string, string> = {
    "--bg-primary":    "#0B0F14",
    "--bg-secondary":  "#111827",
    "--bg-card":       "#1F2937",
    "--border":        "#374151",
    "--text-primary":  "#F9FAFB",
    "--text-secondary":"#D1D5DB",
    "--text-disabled": "#9CA3AF",
    "--accent":        "#22C55E",
    "--accent-dim":    "rgba(34,197,94,0.12)",
    "--accent-glow":   "rgba(34,197,94,0.35)",
  };

  // ─── share handlers ────────────────────────────────────────────────────────
  /**
   * Resolves all var(--xyz) occurrences in every element's inline style
   * inside the cloned document so html2canvas sees real colour values.
   */
  const resolveVars = useCallback((root: HTMLElement) => {
    const varRe = /var\(([^)]+)\)/g;
    root.querySelectorAll<HTMLElement>("*").forEach(el => {
      const s = el.getAttribute("style");
      if (!s) return;
      const resolved = s.replace(varRe, (_: string, name: string) => CSS_VARS[name.trim()] ?? "");
      el.setAttribute("style", resolved);
    });
  }, []);

  const handleDownloadPng = useCallback(async () => {
    if (pngStatus === "working") return;
    setPngStatus("working");
    try {
      const el = document.getElementById("share-card");
      if (!el) return;

      const canvas = await html2canvas(el, {
        // ── render fidelity ──────────────────────────────────────────────
        backgroundColor: "#0B0F14",
        scale: 2,                   // 2× for retina-sharp PNG
        useCORS: true,
        allowTaint: false,
        logging: false,
        // ── font + image timeout ─────────────────────────────────────────
        imageTimeout: 8000,
        // ── clone hook: fix vars & animations before paint ───────────────
        onclone: (clonedDoc: Document) => {
          // 1. Inject Google Fonts so text renders with correct typeface
          const fontLink = clonedDoc.createElement("link");
          fontLink.rel  = "stylesheet";
          fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap";
          clonedDoc.head.appendChild(fontLink);

          // 2. Inject a <style> that resolves all CSS variables
          const varStyle = clonedDoc.createElement("style");
          varStyle.textContent = `:root{${Object.entries(CSS_VARS).map(([k, v]) => `${k}:${v}`).join(";")}} `;
          clonedDoc.head.appendChild(varStyle);

          // 3. Strip animation classes (elements would be invisible at frame 0)
          clonedDoc.querySelectorAll<HTMLElement>(".animate-fade-up,.animate-fade-in").forEach(el => {
            el.classList.remove("animate-fade-up", "animate-fade-in");
            el.style.opacity  = "1";
            el.style.transform = "none";
            el.style.animation = "none";
          });

          // 4. Resolve remaining var(--xyz) in every inline style attribute
          const shareCard = clonedDoc.getElementById("share-card");
          if (shareCard) resolveVars(shareCard);

          // 5. Add visible padding so nothing clips at the edge
          if (shareCard) {
            shareCard.style.padding    = "40px";
            shareCard.style.background = "#0B0F14";
          }
        },
      });

      // ── trigger auto-download ────────────────────────────────────────────
      const link = document.createElement("a");
      link.download = "frs-results.png";
      link.href     = canvas.toDataURL("image/png", 1.0);
      link.click();
    } finally {
      setPngStatus("idle");
    }
  }, [pngStatus, resolveVars]);

  const handleDownloadPDF = useCallback(async () => {
    if (pdfStatus === "working") return;
    setPdfStatus("working");
    try {
      const el = document.getElementById("share-card");
      if (!el) return;

      // Capture with same fidelity fixes as PNG handler
      const canvas = await html2canvas(el, {
        backgroundColor: "#0B0F14",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 8000,
        onclone: (clonedDoc: Document) => {
          const fontLink = clonedDoc.createElement("link");
          fontLink.rel  = "stylesheet";
          fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap";
          clonedDoc.head.appendChild(fontLink);

          const varStyle = clonedDoc.createElement("style");
          varStyle.textContent = `:root{${Object.entries(CSS_VARS).map(([k, v]) => `${k}:${v}`).join(";")}} `;
          clonedDoc.head.appendChild(varStyle);

          clonedDoc.querySelectorAll<HTMLElement>(".animate-fade-up,.animate-fade-in").forEach(el => {
            el.classList.remove("animate-fade-up", "animate-fade-in");
            el.style.opacity  = "1";
            el.style.transform = "none";
            el.style.animation = "none";
          });

          const shareCard = clonedDoc.getElementById("share-card");
          if (shareCard) resolveVars(shareCard);
          if (shareCard) {
            shareCard.style.padding    = "40px";
            shareCard.style.background = "#0B0F14";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const canvasW = canvas.width;
      const canvasH = canvas.height;

      // PDF page sizing: A4 width with height scaled to match aspect ratio
      const pdfPadding = 12; // mm
      const pdfPageW   = 210; // A4 width in mm
      const contentW   = pdfPageW - pdfPadding * 2;
      const contentH   = (canvasH / canvasW) * contentW;
      const pdfPageH   = contentH + pdfPadding * 2;

      const orientation = pdfPageH > pdfPageW ? "portrait" : "landscape";
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [pdfPageW, pdfPageH],
      });

      // Dark background fill
      pdf.setFillColor(11, 15, 20); // #0B0F14
      pdf.rect(0, 0, pdfPageW, pdfPageH, "F");

      // Place captured image centered with padding
      pdf.addImage(imgData, "PNG", pdfPadding, pdfPadding, contentW, contentH);

      // Auto-download
      pdf.save("frs-results.pdf");
    } finally {
      setPdfStatus("idle");
    }
  }, [pdfStatus, resolveVars]);



  if (!mounted || !result) return null;

  const r = result;
  const score = r.finalRegretPct;
  const simScore = simResult?.finalRegretPct ?? score;

  const regretColor =
    score >= 60 ? "#EF4444" :
    score >= 40 ? "#F97316" :
    score >= 25 ? "#EAB308" : "#22C55E";

  const regretLabel =
    score >= 60 ? "High Regret Risk" :
    score >= 40 ? "Moderate Regret Risk" :
    score >= 25 ? "Low–Moderate Risk" : "On Track";

  const regretMsg =
    score >= 60 ? "Your current behavioral patterns strongly predict future regret. Immediate, sustained change is required." :
    score >= 40 ? "You are leaving significant opportunities on the table. Strategic adjustments now will compound over time." :
    score >= 25 ? "You're doing okay — but there is meaningful room to grow before it becomes regret." :
    "Your habits, direction and effort are aligned. Keep compounding this advantage.";

  const MomentumIcon = r.momentum > 1.1 ? TrendingUp : r.momentum < 0.9 ? TrendingDown : Minus;
  const momentumColor = r.momentum > 1.1 ? "#22C55E" : r.momentum < 0.9 ? "#EF4444" : "#EAB308";

  const RED = "#EF4444";
  const GREEN = "#22C55E";

  const riskBreakdown = [
    { label: "Procrastination & Opportunity Loss", value: r.opportunityLoss },
    { label: "Stagnation (low learning & skill)", value: r.stagnationRisk },
    { label: "Burnout (sleep, stress, overwork)", value: r.burnoutRisk },
    { label: "Direction Drift (no goals/clarity)", value: r.directionDrift },
    { label: "Potential Gap (awareness vs. action)", value: r.potentialGap },
    { label: "Existential Regret (no meaning)", value: r.existentialRegret },
  ].map(x => ({ ...x, color: x.value >= 0.5 ? RED : GREEN }));

  const dimGood = [
    { label: "Effort Index", value: r.dims.effort },
    { label: "Discipline", value: r.dims.discipline },
    { label: "Consistency", value: r.consistency },
    { label: "Growth Orientation", value: r.dims.growth },
    { label: "Direction Clarity", value: r.dims.direction },
    { label: "Awareness", value: r.dims.awareness },
    { label: "Meaning Alignment", value: r.meaningAlignment },
  ].map(x => ({ ...x, color: x.value >= 0.5 ? GREEN : RED }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "DM Sans, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 120px" }}>

        {/* ── SHARE CARD WRAPPER ────────────────────────────────────────── */}
        <div id="share-card">

        {/* ── 1. HERO SCORE ─────────────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            Simulation Complete
          </span>
          <div style={{ marginTop: 28, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, opacity: 0.7 }}>Your Future Regret Index</div>
            <div style={{
              fontSize: 108, fontWeight: 900, lineHeight: 1,
              fontFamily: "Syne, sans-serif", color: regretColor,
              textShadow: `0 0 60px ${regretColor}50`,
            }}>
              {score}%
            </div>
            <div style={{
              display: "inline-block", marginTop: 16, fontSize: 12, fontWeight: 700,
              color: regretColor, background: `${regretColor}18`,
              border: `1px solid ${regretColor}40`, borderRadius: 20,
              padding: "4px 16px", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {regretLabel}
            </div>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7, opacity: 0.85 }}>
            {regretMsg}
          </p>
        </div>

        {/* ── 2. STAT GRID ──────────────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.05s", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 56 }}>
          <StatBox
            label="Main Regret Cause"
            value={`${Math.round(Math.max(r.opportunityLoss, r.stagnationRisk, r.burnoutRisk, r.existentialRegret, r.directionDrift, r.potentialGap) * 100)}%`}
            sub={r.mainCause}
            color={regretColor}
          />
          <StatBox
            label="Awareness Amplifier"
            value={`×${r.awarenessAmplifier.toFixed(2)}`}
            sub="Conscious regret multiplier"
            color="#8B5CF6"
          />
          <StatBox
            label="Failure Memory"
            value={pct(r.failureMemory)}
            sub="Emotional carryover from past failures"
            color="#F97316"
          />
          <StatBox
            label="Momentum"
            value={r.momentum > 1.05 ? "↑" : r.momentum < 0.95 ? "↓" : "→"}
            sub={r.momentumTrend}
            color={momentumColor}
          />
        </div>

        {/* ── 3. RISK BREAKDOWN ─────────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Risk Component Breakdown</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "3px 12px" }}>
              ↑ Higher increases regret
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-primary)", opacity: 0.65, marginBottom: 24 }}>
            Exponential penalty scores per risk dimension. Address the highest-red bars first.
          </p>
          <Card>
            {riskBreakdown.map(item => (
              <RiskRow key={item.label} label={item.label} value={item.value} color={item.color} />
            ))}
          </Card>
        </div>

        {/* ── 4. BEHAVIORAL STRENGTHS ───────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.15s", marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Behavioral Strengths</h3>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "3px 12px" }}>
              ↑ Higher is better
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-primary)", opacity: 0.65, marginBottom: 24 }}>
            Your composite behavioral scores — green bars reduce regret. Build these up.
          </p>
          <Card>
            {dimGood.map(item => (
              <RiskRow key={item.label} label={item.label} value={item.value} color={item.color} />
            ))}
          </Card>
        </div>

        {/* ── 5. INSIGHTS GRID ──────────────────────────────────────────── */}
        <div className="animate-fade-up grid grid-cols-1 md:grid-cols-2" style={{ animationDelay: "0.2s", gap: 20, marginBottom: 56 }}>

          {/* Hidden Potential */}
          <Card style={{ borderTop: "3px solid #8B5CF6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Star size={18} color="#8B5CF6" />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#8B5CF6" }}>Hidden Potential Warning</h4>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.7, opacity: 0.85 }}>{r.hiddenPotentialWarning}</p>
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text-disabled)" }}>Potential Gap</span>
              {bar(r.potentialGap, "#8B5CF6")}
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8B5CF6" }}>{pct(r.potentialGap)}</span>
            </div>
          </Card>

          {/* Burnout Risk */}
          <Card style={{ borderTop: "3px solid #EAB308" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Flame size={18} color="#EAB308" />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#EAB308" }}>Burnout Risk</h4>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.7, opacity: 0.85 }}>{r.burnoutRiskLabel}</p>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ marginTop: 14, gap: 8 }}>
              {[
                { label: "Poor Sleep", v: r.dims.poorSleep },
                { label: "High Stress", v: r.dims.highStress },
                { label: "Low Energy", v: r.dims.lowEnergy },
                { label: "Overwork", v: r.dims.overwork },
              ].map(x => (
                <div key={x.label} style={{ textAlign: "center", background: "var(--bg-secondary)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#EAB308" }}>{Math.round(x.v * 100)}%</div>
                  <div style={{ fontSize: 10, color: "var(--text-disabled)" }}>{x.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Existential */}
          <Card style={{ borderTop: "3px solid #EC4899" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Brain size={18} color="#EC4899" />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#EC4899" }}>Existential Dissatisfaction</h4>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.7, opacity: 0.85 }}>{r.existentialDissatisfaction}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              {[
                { label: "Purpose", v: r.dims.purposeConnection },
                { label: "Identity", v: r.dims.identityAlignment },
                { label: "Fulfillment", v: r.dims.emotionalFulfillment },
                { label: "Relationships", v: r.dims.relationshipQuality },
              ].map(x => (
                <div key={x.label} style={{ background: "var(--bg-primary)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#EC4899", fontFamily: "Syne, sans-serif" }}>{pct(x.v)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{x.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Momentum */}
          <Card style={{ borderTop: `3px solid ${momentumColor}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <MomentumIcon size={18} color={momentumColor} />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: momentumColor }}>Momentum & Trajectory</h4>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.7, opacity: 0.85 }}>{r.momentumTrend}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              {[
                { label: "Consistency Score", v: r.consistency },
                { label: "Compounding Score", v: r.compoundingScore },
                { label: "Trajectory Ratio", v: Math.min(1, r.trajectory / 2) },
              ].map(x => (
                <div key={x.label} style={{ background: "var(--bg-primary)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: momentumColor, fontFamily: "Syne, sans-serif" }}>{pct(x.v)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{x.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── 6. IMPROVEMENT PRIORITY ───────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.25s", marginBottom: 56 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Improvement Priority Order</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
            Ranked from highest-impact to lowest. Address these in order for maximum regret reduction.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {r.improvementPriority.map((item, idx) => (
              <Card key={idx} style={{ padding: "16px 22px", display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: idx === 0 ? "#EF4444" : idx === 1 ? "#F97316" : idx === 2 ? "#EAB308" : "#22C55E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "#0B0F14",
                }}>
                  {idx + 1}
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", flex: 1 }}>{item}</span>
              </Card>
            ))}
          </div>
        </div>

        </div>{/* ── end #share-card ─────────────────────────────────────── */}

        {/* ── 7. INTERACTIVE WHAT-IF SIMULATOR ─────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.3s", marginBottom: 56 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Zap size={22} color="#EAB308" /> What-If Simulator
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
              Adjust your habits. See how your regret score changes in real-time.
            </p>
          </div>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {[
                { label: "Boost Effort & Execution", state: adjEffort, set: setAdjEffort, color: "#22C55E" },
                { label: "Improve Discipline", state: adjDiscipline, set: setAdjDiscipline, color: "#22C55E" },
                { label: "Strengthen Consistency", state: adjConsistency, set: setAdjConsistency, color: "#22C55E" },
              ].map(({ label, state, set, color }) => {
                const trackPct = ((state + 50) / 100) * 100;
                const centerPct = 50;
                const trackBg = state >= 0
                  ? `linear-gradient(to right, var(--border) 0%, var(--border) ${centerPct}%, ${color} ${centerPct}%, ${color} ${trackPct}%, var(--border) ${trackPct}%, var(--border) 100%)`
                  : `linear-gradient(to right, var(--border) 0%, var(--border) ${trackPct}%, #EF4444 ${trackPct}%, #EF4444 ${centerPct}%, var(--border) ${centerPct}%, var(--border) 100%)`;
                return (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: state > 0 ? color : state < 0 ? "#EF4444" : "var(--text-disabled)",
                        background: state !== 0 ? `${state > 0 ? color : "#EF4444"}15` : "transparent",
                        border: `1px solid ${state !== 0 ? (state > 0 ? color : "#EF4444") + "40" : "transparent"}`,
                        borderRadius: 6, padding: "2px 8px",
                      }}>
                        {state > 0 ? `+${state}` : state === 0 ? "0" : state}
                      </span>
                    </div>
                    <input type="range" min={-50} max={50} step={5} value={state}
                      onChange={e => set(parseInt(e.target.value))}
                      style={{ background: trackBg, width: "100%" }} />
                  </div>
                );
              })}

              {/* Live delta */}
              <div style={{
                marginTop: 8, padding: "20px 24px",
                background: "var(--bg-secondary)", borderRadius: 12,
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", opacity: 0.5, marginBottom: 4, textTransform: "uppercase" }}>Original Score</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: regretColor, fontFamily: "Syne, sans-serif" }}>{score}%</div>
                </div>
                <div style={{ fontSize: 28, color: "var(--text-primary)", opacity: 0.2 }}>→</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", opacity: 0.5, marginBottom: 4, textTransform: "uppercase" }}>Projected Score</div>
                  <div style={{
                    fontSize: 32, fontWeight: 900, fontFamily: "Syne, sans-serif",
                    color: simScore < score ? "#22C55E" : simScore > score ? "#EF4444" : "var(--text-secondary)",
                  }}>
                    {simScore}%
                  </div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800,
                  color: simScore < score ? "#22C55E" : simScore > score ? "#EF4444" : "var(--text-disabled)",
                }}>
                  {simScore < score ? `▼ ${(score - simScore).toFixed(1)}% less regret` :
                   simScore > score ? `▲ ${(simScore - score).toFixed(1)}% more regret` :
                   "No change"}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── SHARE RESULTS ─────────────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.4s", marginBottom: 56 }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.14em",
            }}>Share Your Results</span>
            <h3 style={{
              fontSize: 22, fontWeight: 800, marginTop: 10, marginBottom: 8,
              background: "linear-gradient(135deg, #fff 30%, var(--accent))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Export &amp; Share</h3>
            <p style={{
              fontSize: 14, color: "var(--text-primary)", opacity: 0.6, maxWidth: 400, margin: "0 auto",
            }}>
              Save your regret analysis as an image or PDF, or copy a direct link.
            </p>
          </div>

          {/* Buttons row */}
          <div style={{
            display: "flex", gap: 14, justifyContent: "center",
            flexWrap: "wrap",
          }}>

            {/* Download PNG */}
            <button
              id="share-btn-png"
              onClick={handleDownloadPng}
              disabled={pngStatus === "working"}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                background: "linear-gradient(135deg, #6366f1, #8B5CF6)",
                border: "none", borderRadius: 10, padding: "13px 26px",
                fontSize: 15, fontWeight: 700, color: "#fff",
                cursor: pngStatus === "working" ? "wait" : "pointer",
                boxShadow: "0 0 24px #6366f140",
                transition: "all 0.25s", opacity: pngStatus === "working" ? 0.7 : 1,
                minWidth: 172,
              }}
              onMouseEnter={e => { if (pngStatus !== "working") (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {pngStatus === "working" ? "Capturing…" : "Download PNG"}
            </button>

            {/* Download PDF */}
            <button
              id="share-btn-pdf"
              onClick={handleDownloadPDF}
              disabled={pdfStatus === "working"}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                background: "linear-gradient(135deg, #EF4444, #F97316)",
                border: "none", borderRadius: 10, padding: "13px 26px",
                fontSize: 15, fontWeight: 700, color: "#fff",
                cursor: pdfStatus === "working" ? "wait" : "pointer",
                boxShadow: "0 0 24px #EF444440",
                transition: "all 0.25s", opacity: pdfStatus === "working" ? 0.7 : 1,
                minWidth: 172,
              }}
              onMouseEnter={e => { if (pdfStatus !== "working") (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              {pdfStatus === "working" ? "Generating…" : "Download PDF"}
            </button>

          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ animationDelay: "0.45s", textAlign: "center", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-primary)", borderRadius: 8, padding: "12px 28px",
              fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              ← Retake Assessment
            </button>
          </Link>
        </div>

      </div>


    </div>
  );
}

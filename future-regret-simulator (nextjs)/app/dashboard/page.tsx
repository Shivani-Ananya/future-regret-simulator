"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, Button, SectionHeader } from "@/components/ui";
import { categories, buildDefaultSliders } from "./questions";
import { ChevronRight, ChevronLeft, Info } from "lucide-react";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState(0);
  const [sliders, setSliders] = useState<Record<string, number>>(() => buildDefaultSliders());
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSlider = (id: string, val: number) => {
    setSliders(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = () => {
    localStorage.setItem(
      "frs_answers",
      JSON.stringify({
        sliders,
        timeInMonths: 60,
        previousFailureMemory: 0,
        current30DayAverage: 0.5,
        previous30DayAverage: 0.5,
      })
    );
    setLoading(true);
    setTimeout(() => { window.location.href = "/simulation"; }, 1500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <div style={{ width: 56, height: 56, border: "2px solid var(--border)", borderTop: "2px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Running behavioral simulation…</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Applying nonlinear penalty model across 6 dimensions</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const currentCategory = categories[activeSection];
  const progressPercent = ((activeSection + 1) / categories.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="max-w-[900px] w-full mx-auto px-5 md:px-6 py-10 md:py-16 pb-32">


        <div className="animate-fade-up" style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Simulation Setup
          </span>
          <h1 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 800, color: "var(--text-primary)", marginTop: 8, letterSpacing: "-0.02em" }}>
            Tell us about yourself
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginTop: 10 }}>
            Answer honestly — each input uses a realistic scale. Hover the <Info size={13} style={{ display: "inline", verticalAlign: "middle" }} /> icon for context.
          </p>
        </div>

        <div className="animate-fade-up">

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
            <span>Section {activeSection + 1} of {categories.length}</span>
            <span>{Math.round(progressPercent)}% Completed</span>
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2, marginBottom: 40, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPercent}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.35s ease" }} />
          </div>


          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setActiveSection(idx)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  transition: "all 0.2s",
                  background: idx === activeSection ? "var(--accent)" : "var(--bg-card)",
                  color: idx === activeSection ? "#0B0F14" : "var(--text-secondary)",
                  borderColor: idx === activeSection ? "var(--accent)" : "var(--border)",
                }}
              >
                {cat.title.replace(/^\d+\. /, "")}
              </button>
            ))}
          </div>

          <Card className="max-md:!w-full max-md:!max-w-full max-md:!overflow-hidden max-md:!p-4 max-md:!min-h-0" style={{ marginBottom: 32, minHeight: 420 }}>
            <SectionHeader
              step={`Section 0${activeSection + 1}`}
              title={currentCategory.title}
              subtitle={currentCategory.description}
            />
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 28 }}>
              {currentCategory.questions.map(q => {
                const val = sliders[q.id] ?? q.defaultValue;
                const trackPct = ((val - q.min) / (q.max - q.min)) * 100;
                

                const RED = "#EF4444";
                const GREEN = "#22C55E";
                let sliderColor = GREEN;
                
                if (q.higherIsBetter) {
                  sliderColor = trackPct < 50 ? RED : GREEN;
                } else {
                  sliderColor = trackPct < 50 ? GREEN : RED;
                }

                const trackBg = `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${trackPct}%, var(--border) ${trackPct}%, var(--border) 100%)`;


                const inOptimal = val >= q.optimalMin && val <= q.optimalMax;

                return (
                  <div key={q.id} className="max-md:!w-full max-md:!max-w-full max-md:!overflow-hidden" style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>

                    <div className="max-md:!flex-col max-md:!items-start max-md:!gap-2 max-md:!w-full" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="max-md:!max-w-full max-md:!w-full max-md:!flex max-md:!justify-between max-md:!items-start" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <label className="max-md:!break-words max-md:!whitespace-normal max-md:!flex-1" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                          {q.label}
                        </label>
                        <button
                          onClick={() => setTooltipId(tooltipId === q.id ? null : q.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-disabled)", padding: "6px", display: "flex", minWidth: 28, minHeight: 28, alignItems: "center", justifyContent: "center" }}
                        >
                          <Info size={13} />
                        </button>
                      </div>
                      <div className="max-md:!w-full max-md:!justify-start" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                         <input
                          type="number"
                          min={q.min}
                          max={q.max}
                          step={q.step}
                          value={val}
                          onChange={e => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) handleSlider(q.id, v);
                          }}
                          onBlur={e => {
                            const v = parseFloat(e.target.value);
                            if (isNaN(v) || v < q.min) handleSlider(q.id, q.min);
                            else if (v > q.max) handleSlider(q.id, q.max);
                          }}
                          style={{
                            fontSize: 14, fontWeight: 700,
                            color: inOptimal ? "#22C55E" : "var(--accent)",
                            background: "var(--bg-secondary)",
                            border: `1px solid ${inOptimal ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                            borderRadius: 6, width: 60, textAlign: "center",
                            padding: "6px", outline: "none",
                          }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{q.unit}</span>
                      </div>
                    </div>


                    {tooltipId === q.id && (
                      <div style={{
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                        borderRadius: 8, padding: "10px 14px", fontSize: 12,
                        color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 4,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                      }}>
                        <span style={{ color: "var(--accent)", fontWeight: 800 }}>PRO TIP:</span> {q.tooltip}
                      </div>
                    )}


                    <div className="max-md:!flex-col max-md:!items-start max-md:!gap-2" style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <p className="max-md:!w-full max-md:!flex-none" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", opacity: 0.9, margin: 0, flex: 1, lineHeight: 1.5 }}>{q.description}</p>
                      {q.id === 'g4' ? (
                        <span className="max-md:!whitespace-normal max-md:!w-auto max-md:!text-left max-md:!self-start" style={{ fontSize: 9, fontWeight: 800, color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                          ↑ Higher increases regret
                        </span>
                      ) : (
                        <span className="max-md:!whitespace-normal max-md:!w-auto max-md:!text-left max-md:!self-start" style={{ fontSize: 9, fontWeight: 800, color: "#22C55E", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                          ↑ Higher is better
                        </span>
                      )}
                    </div>


                    <input
                      className="max-md:!w-full max-md:!max-w-full"
                      type="range"
                      min={q.min}
                      max={q.max}
                      step={q.step}
                      value={val}
                      onChange={e => handleSlider(q.id, parseFloat(e.target.value))}
                      style={{ background: trackBg, width: "100%", minWidth: 0 }}
                    />


                    <div style={{ position: "relative", height: 18 }}>
                      <span style={{ position: "absolute", left: 0, fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {q.min}{q.unit !== "/10" ? ` ${q.unit}` : ""}
                      </span>
                      <span style={{ position: "absolute", right: 0, fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                        {q.max}{q.unit !== "/10" ? ` ${q.unit}` : ""}
                      </span>
                    </div>


                    {inOptimal && (
                      <span className="max-md:!whitespace-normal max-md:!self-start max-md:!w-auto max-md:!text-left" style={{
                        fontSize: 10, fontWeight: 700, color: "#22C55E",
                        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                        borderRadius: 4, padding: "2px 6px", alignSelf: "flex-start",
                      }}>
                        ✓ OPTIMAL ZONE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, marginBottom: 32 }}>
            <Button variant="secondary" onClick={() => setActiveSection(p => Math.max(0, p - 1))} disabled={activeSection === 0}>
              <ChevronLeft size={18} /><span>Previous</span>
            </Button>

            {activeSection === categories.length - 1 ? (
              <Button variant="primary" onClick={handleSubmit}>
                <span>Run Simulation</span><ChevronRight size={18} />
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setActiveSection(p => Math.min(categories.length - 1, p + 1))}>
                <span>Next Section</span><ChevronRight size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

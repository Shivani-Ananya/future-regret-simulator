/**
 * Future Regret Simulator — Behavioral Calculation Engine v2.0
 *
 * Architecture:
 *   Raw Inputs → Normalization → Behavioral Dimensions →
 *   Derived Risk Components → Base Regret → Amplifiers → Final Regret %
 */

import { categories, Question } from "@/app/dashboard/questions";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Clamp a value between [lo, hi] */
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

/**
 * Normalize a raw value to [0, 1] using the question's declared min/max.
 * Inverted = true means "higher raw → lower risk" (e.g. Procrastination Resistance 10 = GOOD)
 */
function normalize(raw: number, q: Question, invert = false): number {
  const n = clamp((raw - q.min) / (q.max - q.min));
  return invert ? 1 - n : n;
}

// ─── QUESTION ID LOOKUPS (matches questions.ts) ───────────────────────────────

/** Convenience: look up a question by id from the flat list */
function getQ(id: string): Question {
  for (const cat of categories) {
    const q = cat.questions.find((q) => q.id === id);
    if (q) return q;
  }
  throw new Error(`Question "${id}" not found`);
}

// ─── PUBLIC INTERFACE ─────────────────────────────────────────────────────────

export interface RegretEngineInput {
  /** Raw slider values keyed by question id */
  sliders: Record<string, number>;
  /**
   * Time horizon the user is considering (months).
   * Defaults to 60 (5 years) if omitted.
   */
  timeInMonths?: number;
  /**
   * Previous failure memory (0–1) carried from a prior session.
   * Defaults to 0 if omitted.
   */
  previousFailureMemory?: number;
  /**
   * Current 30-day average score (0–1) for trajectory calculation.
   * Defaults to 0.5 if omitted.
   */
  current30DayAverage?: number;
  /**
   * Previous 30-day average score (0–1) for trajectory calculation.
   * Defaults to 0.5 if omitted (trajectory = 1.0, neutral).
   */
  previous30DayAverage?: number;
}

export interface RegretEngineOutput {
  /** Final 0–100 regret percentage */
  finalRegretPct: number;

  // ── Normalized behavioral dimensions ──
  dims: {
    procrastination: number; // 0=good, 1=bad
    distraction: number;
    timeWaste: number;
    lowExecution: number;
    poorSleep: number;
    highStress: number;
    overwork: number;
    lowEnergy: number;
    lowLearning: number;
    comfortZone: number;
    curiosityDeficit: number;
    lowSkillGrowth: number;
    routineAdherence: number;
    dailyExecution: number;
    recoveryBalance: number;
    studyHours: number;
    deepWork: number;
    productivity: number;
    commitment: number;
    executionSpeed: number;
    growth: number;
    direction: number;
    awareness: number;
    discipline: number;
    effort: number;
    purposeConnection: number;
    identityAlignment: number;
    emotionalFulfillment: number;
    relationshipQuality: number;
  };

  // ── Risk components ──
  opportunityLoss: number;
  burnoutRisk: number;
  stagnationRisk: number;
  consistency: number;
  potentialGap: number;
  directionDrift: number;
  meaningAlignment: number;
  existentialRegret: number;
  baseRegret: number;

  // ── Amplifiers ──
  awarenessAmplifier: number;
  failureMemory: number;
  timeFactor: number;
  regretIndex: number;

  // ── Trajectory ──
  trajectory: number;
  momentum: number;
  compoundingScore: number;

  // ── Insight helpers ──
  mainCause: string;
  hiddenPotentialWarning: string;
  burnoutRiskLabel: string;
  existentialDissatisfaction: string;
  momentumTrend: string;
  improvementPriority: string[];
}

// ─── ENGINE ───────────────────────────────────────────────────────────────────

export function runRegretEngine(input: RegretEngineInput): RegretEngineOutput {
  const s = input.sliders;
  const timeInMonths = input.timeInMonths ?? 60;
  const prevFailure = clamp(input.previousFailureMemory ?? 0);
  const curr30 = clamp(input.current30DayAverage ?? 0.5);
  const prev30 = clamp(input.previous30DayAverage ?? 0.5);

  // ── 1. NORMALIZE ALL INPUTS ────────────────────────────────────────────────
  // Questions where higher raw value = GOOD (invert = true → normalized risk = 1-n)
  // Questions where higher raw value = BAD (invert = false → normalized risk = n)

  // Growth & Effort (g1–g8)
  const studyHours   = normalize(s.g1 ?? 4,  getQ("g1"), false); // higher hrs = less procrastination risk (NOT inverted for "risk" – see below)
  const deepWork     = normalize(s.g2 ?? 2,  getQ("g2"), false);
  const productivity = normalize(s.g3 ?? 40, getQ("g3"), false);
  const timeWaste    = normalize(s.g4 ?? 4,  getQ("g4"), false);  // higher waste = higher risk (NOT inverted)
  const learning     = normalize(s.g5 ?? 5,  getQ("g5"), false);
  const skillGrowth  = normalize(s.g6 ?? 5,  getQ("g6"), false);
  const commitment   = normalize(s.g7 ?? 5,  getQ("g7"), false);
  const executionSpd = normalize(s.g8 ?? 5,  getQ("g8"), false);

  // Discipline & Habits (d1–d7)
  const procResist   = normalize(s.d1 ?? 5, getQ("d1"), false); // 10 = max resistance (low procrastination)
  const distResist   = normalize(s.d2 ?? 5, getQ("d2"), false);
  const routine      = normalize(s.d3 ?? 5, getQ("d3"), false);
  const sleepHrs     = normalize(s.d4 ?? 7, getQ("d4"), false);
  const selfControl  = normalize(s.d5 ?? 5, getQ("d5"), false);
  const followThru   = normalize(s.d6 ?? 5, getQ("d6"), false);
  const timeMgmt     = normalize(s.d7 ?? 5, getQ("d7"), false);

  // Direction & Clarity (c1–c7)
  const careerClarity  = normalize(s.c1 ?? 5, getQ("c1"), false);
  const longVision     = normalize(s.c2 ?? 5, getQ("c2"), false);
  const goalSetting    = normalize(s.c3 ?? 5, getQ("c3"), false);
  const strategic      = normalize(s.c4 ?? 5, getQ("c4"), false);
  const riskTol        = normalize(s.c5 ?? 5, getQ("c5"), false);
  const goalAction     = normalize(s.c6 ?? 5, getQ("c6"), false);
  const adaptability   = normalize(s.c7 ?? 5, getQ("c7"), false);

  // Finance (f1–f5)
  const savingsRate    = normalize(s.f1 ?? 15, getQ("f1"), false);
  const spendIntent    = normalize(s.f2 ?? 5,  getQ("f2"), false);
  const investAware    = normalize(s.f3 ?? 4,  getQ("f3"), false);
  const finPlan        = normalize(s.f4 ?? 5,  getQ("f4"), false);
  const emergFund      = normalize(s.f5 ?? 4,  getQ("f5"), false);

  // Health & Energy (h1–h5)
  const physActivity   = normalize(s.h1 ?? 3, getQ("h1"), false);
  const energyLvl      = normalize(s.h2 ?? 5, getQ("h2"), false);
  const stressMgmt     = normalize(s.h3 ?? 5, getQ("h3"), false);
  const sleepQuality   = normalize(s.h4 ?? 5, getQ("h4"), false);
  const mentalClarity  = normalize(s.h5 ?? 5, getQ("h5"), false);

  // Awareness & Mindset (p1–p7)
  const selfReflect    = normalize(s.p1 ?? 5, getQ("p1"), false);
  const growthMindset  = normalize(s.p2 ?? 5, getQ("p2"), false);
  const emotIntel      = normalize(s.p3 ?? 5, getQ("p3"), false);
  const selfAwareness  = normalize(s.p4 ?? 5, getQ("p4"), false);
  const resilience     = normalize(s.p5 ?? 5, getQ("p5"), false);
  const feedbackAcc    = normalize(s.p6 ?? 5, getQ("p6"), false);
  const constMindset   = normalize(s.p7 ?? 5, getQ("p7"), false);

  // ── 2. BEHAVIORAL DIMENSION AGGREGATES (0=bad, 1=good) ───────────────────

  // For risk formulas, we need "failure" values (0=good, 1=bad)
  // procrastination: if procResist=1 (max resistance) → procrastination risk = 0
  const procrastination  = 1 - procResist;
  const distraction      = 1 - distResist;
  const timeWasteRisk    = timeWaste; // raw higher = more waste
  const lowExecution     = 1 - ((executionSpd + selfControl + followThru) / 3);

  // Sleep: optimal 7–8 hrs. Normalize: map raw to deviation from optimal
  // Re-map sleep hours to a "poorSleep" risk [0,1]
  // <5hrs → high risk, 7–8hrs → low risk, >9hrs → moderate risk
  const rawSleep = s.d4 ?? 7;
  const sleepRisk = rawSleep < 5
    ? 0.9
    : rawSleep <= 6
    ? 0.5
    : rawSleep <= 8.5
    ? 0.1
    : rawSleep <= 10
    ? 0.3
    : 0.5;
  const poorSleep    = sleepRisk;
  const highStress   = 1 - stressMgmt;
  const overwork     = clamp(((s.g1 ?? 4) - 9) / 3); // beyond 9hrs/day = overwork risk
  const lowEnergy    = 1 - ((energyLvl + mentalClarity) / 2);

  const lowLearning  = 1 - ((learning + growthMindset + feedbackAcc) / 3);
  const comfortZone  = 1 - ((riskTol + adaptability) / 2);
  const curiosityDef = 1 - selfReflect;
  const lowSkill     = 1 - skillGrowth;

  const routineAdh   = (routine + constMindset + timeMgmt) / 3;
  const dailyExec    = (followThru + goalAction) / 2;
  const recovery     = (resilience + (1 - overwork)) / 2;

  // Composite "good" dimensions (0=poor, 1=elite)
  const growthDim    = clamp(0.40 * deepWork + 0.20 * studyHours + 0.15 * productivity + 0.15 * learning + 0.10 * skillGrowth);
  const directionDim = clamp(0.50 * careerClarity + 0.20 * longVision + 0.15 * goalSetting + 0.15 * strategic);
  const awarenessDim = clamp((selfAwareness + selfReflect + growthMindset + emotIntel + resilience) / 5);
  const disciplineDim = clamp((procResist + distResist + routine + selfControl + followThru + timeMgmt) / 6);
  const effortDim    = clamp(0.30 * studyHours + 0.30 * deepWork + 0.20 * productivity + 0.10 * commitment + 0.10 * executionSpd);

  // ── 3. CONSISTENCY ────────────────────────────────────────────────────────
  // Consistency -> medium impact
  const consistency = clamp(
    0.50 * routineAdh +
    0.30 * dailyExec +
    0.20 * recovery
  );

  // ── 4. OPPORTUNITY LOSS ───────────────────────────────────────────────────
  const P = clamp(procrastination);
  const D = clamp(distraction);
  const T = clamp(timeWasteRisk);
  const E = clamp(lowExecution);
  const opportunityLoss = clamp(
    0.45 * Math.pow(T, 1.2) + // Time waste -> very high negative impact
    0.25 * Math.pow(P, 1.2) +
    0.15 * Math.pow(D, 1.2) +
    0.15 * Math.pow(E, 1.2)
  );

  // ── 5. BURNOUT RISK ───────────────────────────────────────────────────────
  const burnoutRisk = clamp(
    0.30 * Math.pow(clamp(poorSleep), 1.8) +
    0.25 * Math.pow(clamp(highStress), 1.6) +
    0.25 * Math.pow(clamp(overwork), 1.5) +
    0.20 * Math.pow(clamp(lowEnergy), 1.4)
  );

  // ── 6. STAGNATION RISK ────────────────────────────────────────────────────
  const stagnationRisk = clamp(
    0.30 * Math.pow(clamp(lowLearning), 1.5) +
    0.25 * Math.pow(clamp(comfortZone), 1.4) +
    0.20 * Math.pow(clamp(curiosityDef), 1.3) +
    0.25 * Math.pow(clamp(lowSkill), 1.5)
  );

  // ── 7. EFFORT & POTENTIAL GAP ─────────────────────────────────────────────
  // High effort and awareness should lower the gap, thus lowering regret.
  const potentialGap = clamp(1 - (0.5 * awarenessDim + 0.5 * effortDim));

  // ── 8. DIRECTION DRIFT ────────────────────────────────────────────────────
  const directionDrift = clamp(1 - directionDim);

  // ── 9. MEANING / EXISTENTIAL ──────────────────────────────────────────────
  const purposeConn   = (longVision + goalAction + growthMindset) / 3;
  const identityAlign = (selfAwareness + constMindset + commitment) / 3;
  const emotFulfill   = (emotIntel + resilience + energyLvl) / 3;
  const relQuality    = (emotIntel + feedbackAcc + selfReflect) / 3;

  const meaningAlignment = clamp(
    0.35 * purposeConn +
    0.25 * identityAlign +
    0.20 * emotFulfill +
    0.20 * relQuality
  );

  // existentialRegret: three terms each in [0,1], max possible sum = 3.0 → normalize
  const existentialRegretRaw =
    (1 - meaningAlignment) + potentialGap + directionDrift;
  const existentialRegret = clamp(existentialRegretRaw / 3);

  // ── 10. BASE REGRET ───────────────────────────────────────────────────────
  // Weighted average of all risk components (each in [0,1])
  // Weights reflect psychological impact ordering from research
  const baseRegret = clamp(
    0.25 * opportunityLoss  +
    0.20 * stagnationRisk   +
    0.15 * existentialRegret +
    0.15 * directionDrift   +
    0.15 * burnoutRisk      +
    0.10 * potentialGap
  );

  // ── 11. TIME DYNAMICS ─────────────────────────────────────────────────────
  const trajectory = prev30 > 0 ? clamp(curr30 / prev30, 0, 2) : 1;
  const momentum = clamp(0.60 * trajectory + 0.40 * consistency, 0, 2);
  const compoundingScore = clamp(consistency * clamp(timeInMonths / 60));

  // ── 12. AWARENESS AMPLIFIER (logarithmic) ─────────────────────────────────
  const A = clamp(awarenessDim);
  // High awareness should lower regret penalty
  const awarenessAmplifier = 0.5 + 0.5 * (1 - A);

  // ── 13. FAILURE MEMORY ────────────────────────────────────────────────────
  const currentFailure = clamp(opportunityLoss * 0.5 + stagnationRisk * 0.5);
  const failureMemory = clamp(prevFailure * 0.85 + currentFailure);

  // ── 14. TIME FACTOR ───────────────────────────────────────────────────────
  // Controlled: 60 months (5 yrs) → ×2, 120 months (10 yrs) → ×3
  const timeFactor = 1 + timeInMonths / 60;

  // ── 15. FINAL REGRET INDEX ────────────────────────────────────────────────
  // Raw index before calibration divisor
  const regretIndexRaw =
    baseRegret * awarenessAmplifier * timeFactor * (1 + failureMemory);

  // Calibration divisor: with all amplifiers at default (5yr, 0 prev failure, 0.5 awareness),
  // max amplifier product ≈ 1.24 × 2 × 1.41 ≈ 3.5. Divisor ensures baseRegret=0.5 → ~50%.
  const CALIBRATION_DIVISOR = 1.8;
  const regretIndex = regretIndexRaw / CALIBRATION_DIVISOR;

  // 5. Clamp final score: 0% minimum, 100% maximum
  const finalRegretPct = clamp(regretIndex * 100, 0, 100);

  // ── 16. INSIGHT GENERATION ───────────────────────────────────────────────

  // Find main cause
  const causes = [
    { label: "Opportunity Loss (procrastination & distraction)", value: opportunityLoss },
    { label: "Stagnation (low learning & comfort zone)", value: stagnationRisk },
    { label: "Burnout Risk (sleep, stress & overwork)", value: burnoutRisk },
    { label: "Existential Drift (no purpose or meaning)", value: existentialRegret },
    { label: "Direction Drift (lack of goals & clarity)", value: directionDrift },
    { label: "Potential Gap (high awareness, low execution)", value: potentialGap },
  ];
  causes.sort((a, b) => b.value - a.value);
  const mainCause = causes[0].label;

  const hiddenPotentialWarning =
    potentialGap > 0.35
      ? `You have significant untapped potential (gap: ${Math.round(potentialGap * 100)}%). Your capability exceeds your execution.`
      : potentialGap > 0.15
      ? `Moderate potential gap detected (${Math.round(potentialGap * 100)}%). Bridge it with consistent daily action.`
      : "Your potential and execution are well-aligned. Keep compounding.";

  const burnoutRiskLabel =
    burnoutRisk > 0.6
      ? "CRITICAL — Immediate lifestyle correction needed"
      : burnoutRisk > 0.4
      ? "HIGH — Sustainable output requires better recovery"
      : burnoutRisk > 0.2
      ? "MODERATE — Monitor your energy and sleep closely"
      : "LOW — Your health habits support long-term performance";

  const existentialDissatisfaction =
    meaningAlignment < 0.3
      ? "DEEP — You feel disconnected from purpose and identity"
      : meaningAlignment < 0.5
      ? "MODERATE — Some misalignment with your deeper values"
      : meaningAlignment < 0.7
      ? "MILD — You have a sense of direction but clarity can improve"
      : "ALIGNED — You feel connected to your purpose and identity";

  const momentumTrend =
    momentum > 1.2
      ? "↑ Accelerating — You're building powerful positive momentum"
      : momentum > 0.9
      ? "→ Stable — Consistent but not compounding"
      : "↓ Declining — Current trajectory is compounding regret";

  // Improvement priority: sort domains by deficiency
  const domains = [
    { name: "Reduce Procrastination & Distraction", score: 1 - opportunityLoss },
    { name: "Build Learning & Curiosity Habits", score: 1 - stagnationRisk },
    { name: "Optimize Sleep, Stress & Energy", score: 1 - burnoutRisk },
    { name: "Clarify Goals & Long-Term Direction", score: directionDim },
    { name: "Strengthen Consistency & Routine", score: consistency },
    { name: "Deepen Purpose & Meaning Connection", score: meaningAlignment },
  ];
  domains.sort((a, b) => a.score - b.score);
  const improvementPriority = domains.slice(0, 4).map((d) => d.name);

  return {
    finalRegretPct: Math.round(finalRegretPct * 10) / 10,
    dims: {
      procrastination,
      distraction,
      timeWaste: timeWasteRisk,
      lowExecution,
      poorSleep,
      highStress,
      overwork,
      lowEnergy,
      lowLearning,
      comfortZone,
      curiosityDeficit: curiosityDef,
      lowSkillGrowth: lowSkill,
      routineAdherence: routineAdh,
      dailyExecution: dailyExec,
      recoveryBalance: recovery,
      studyHours,
      deepWork,
      productivity,
      commitment,
      executionSpeed: executionSpd,
      growth: growthDim,
      direction: directionDim,
      awareness: awarenessDim,
      discipline: disciplineDim,
      effort: effortDim,
      purposeConnection: purposeConn,
      identityAlignment: identityAlign,
      emotionalFulfillment: emotFulfill,
      relationshipQuality: relQuality,
    },
    opportunityLoss,
    burnoutRisk,
    stagnationRisk,
    consistency,
    potentialGap,
    directionDrift,
    meaningAlignment,
    existentialRegret,
    baseRegret,
    awarenessAmplifier,
    failureMemory,
    timeFactor,
    regretIndex,
    trajectory,
    momentum,
    compoundingScore,
    mainCause,
    hiddenPotentialWarning,
    burnoutRiskLabel,
    existentialDissatisfaction,
    momentumTrend,
    improvementPriority,
  };
}

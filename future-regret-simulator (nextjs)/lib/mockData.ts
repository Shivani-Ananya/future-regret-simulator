export const mockGrowthData = [
  { year: "Now", optimistic: 10, realistic: 10, pessimistic: 10 },
  { year: "Y1", optimistic: 22, realistic: 16, pessimistic: 11 },
  { year: "Y2", optimistic: 38, realistic: 24, pessimistic: 13 },
  { year: "Y3", optimistic: 58, realistic: 34, pessimistic: 15 },
  { year: "Y4", optimistic: 74, realistic: 42, pessimistic: 14 },
  { year: "Y5", optimistic: 92, realistic: 55, pessimistic: 18 },
];

export const mockSkillData = [
  { year: "Now", skill: 3 },
  { year: "Y1", skill: 4.2 },
  { year: "Y2", skill: 5.8 },
  { year: "Y3", skill: 7.1 },
  { year: "Y4", skill: 8.0 },
  { year: "Y5", skill: 8.9 },
];

export const mockSatisfactionData = [
  { year: "Now", score: 5 },
  { year: "Y1", score: 5.5 },
  { year: "Y2", score: 6.2 },
  { year: "Y3", score: 7.0 },
  { year: "Y4", score: 6.8 },
  { year: "Y5", score: 8.1 },
];

export const mockTimelineCards = [
  {
    id: 1,
    scenario: "High Effort Path",
    description: "You push hard, build consistent habits, and invest in skill development. Career trajectory accelerates by Year 3.",
    regret: 12,
    tag: "Optimistic",
    color: "green" as const,
  },
  {
    id: 2,
    scenario: "Status Quo Path",
    description: "You maintain current routines with minor improvements. Steady but slow progress, comfort-zone-driven decisions.",
    regret: 41,
    tag: "Realistic",
    color: "yellow" as const,
  },
  {
    id: 3,
    scenario: "Drift Path",
    description: "Procrastination and distraction dominate. Skills stagnate. Opportunities missed due to indecision and low risk tolerance.",
    regret: 78,
    tag: "Pessimistic",
    color: "red" as const,
  },
];

export const mockRegretBreakdown = [
  { label: "Missed Opportunities", value: 34, color: "#EF4444" },
  { label: "Low Growth", value: 28, color: "#EAB308" },
  { label: "Risk Mismatch", value: 22, color: "#F97316" },
  { label: "Poor Habits", value: 16, color: "#9CA3AF" },
];

export const mockMilestones = [
  {
    year: "Year 1",
    events: [
      "Foundation skills established",
      "First income milestone reached",
      "Key habits locked in or broken",
    ],
    status: "critical",
  },
  {
    year: "Year 3",
    events: [
      "Career trajectory becomes visible",
      "Network effects compound",
      "Financial habits show real impact",
    ],
    status: "important",
  },
  {
    year: "Year 5",
    events: [
      "Compounding growth vs stagnation diverge sharply",
      "Peer gap becomes undeniable",
      "Regret or momentum fully crystallized",
    ],
    status: "defining",
  },
];

export const mockSavedSimulations = [
  {
    id: 1,
    name: "Tech Career Path",
    date: "Apr 12, 2025",
    regretScore: 18,
    scenario: "High Effort",
    tag: "green" as const,
  },
  {
    id: 2,
    name: "Entrepreneur Route",
    date: "Apr 8, 2025",
    regretScore: 35,
    scenario: "Status Quo",
    tag: "yellow" as const,
  },
  {
    id: 3,
    name: "Freelance Focus",
    date: "Mar 29, 2025",
    regretScore: 52,
    scenario: "Drift Path",
    tag: "red" as const,
  },
];

export type DebateSide = "tech" | "human";

export type DebatePanelist = {
  name: string;
  role: string;
  company: string;
  expertise: string;
  photo: string;
  bio: string[];
};

export type DebateTopicIcon = "jobs" | "creativity" | "skills" | "leadership" | "decisions" | "innovation";

export type DebateTopic = {
  icon: DebateTopicIcon;
  question: string;
};

export const debateHeader = {
  kicker: "Mesa de debate · Human Intelligence",
  title: "¿Puede la Inteligencia Artificial reemplazar el potencial humano?",
  badges: ["6 líderes", "1 conversación", "Múltiples perspectivas"],
} as const;

export const debateModerator = {
  kicker: "Moderador",
  firstName: "Héctor",
  lastName: "Landeros",
  role: "Moderador de la conversación.",
  photo: "/disruptors/hector-landeros-v1.jpg",
} as const;

export const debateTopicsTitle = "Los temas que abriremos en la conversación";

export const debateTopics: DebateTopic[] = [
  { icon: "jobs", question: "¿La IA está transformando o reemplazando empleos?" },
  { icon: "creativity", question: "¿Puede la creatividad ser automatizada?" },
  { icon: "skills", question: "¿Qué habilidades serán indispensables en 2030?" },
  { icon: "leadership", question: "¿Cómo liderar organizaciones híbridas?" },
  { icon: "decisions", question: "¿Quién tomará las decisiones críticas en el futuro?" },
  { icon: "innovation", question: "¿Cómo impulsar la innovación centrada en las personas?" },
];

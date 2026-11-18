import type { V2Answers, V2Question } from "@/lib/methodology/v2/types";

const PILLARS = [
  ["ED-01", "Trámites"],
  ["ED-02", "Seguridad"],
  ["ED-03", "Autoridad"],
  ["ED-04", "Infraestructura"],
  ["ED-05", "Justicia"],
] as const;

const CX = 160, CY = 168, RADIUS = 92, LABEL_OFFSET = 16;
const ACCENT = "var(--brand-primary)";
const GRID = "var(--border-default)", INK = "var(--text-primary)", MUTED = "var(--text-muted)";
const RINGS = [0.25, 0.5, 0.75, 1];

function clamp(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function pointAt(index: number, radius: number) {
  const angle = ((-90 + index * 72) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

function toPoints(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function axesFrom(questions: V2Question[], answers: V2Answers) {
  const axes: { label: string; value: number }[] = [];
  for (const [id, label] of PILLARS) {
    const question = questions.find((item) => item.id === id);
    const answer = answers[id];
    if (!question || !answer || (answer.kind !== "single" && answer.kind !== "text")) return null;
    const option = question.options?.find((item) => item.value === answer.optionValue);
    if (!option || option.score === null) return null;
    axes.push({ label, value: option.score });
  }
  return axes;
}

export function Pentagon({ questions, answers }: { questions: V2Question[]; answers: V2Answers }) {
  const axes = axesFrom(questions, answers);
  if (!axes) return null;
  const outer = axes.map((_, index) => pointAt(index, RADIUS));
  const data = axes.map((axis, index) => pointAt(index, (clamp(axis.value) / 100) * RADIUS));
  const caption = "El entorno, en detalle";
  const ariaLabel = `${caption}. ${axes.map((axis) => `${axis.label} ${Math.round(clamp(axis.value))}`).join(", ")}`;

  return (
    <figure className="mx-auto w-full max-w-[320px]">
      <p className="text-center text-small font-medium text-brand">{caption}</p>
      <svg viewBox="0 0 320 340" className="h-auto w-full" role="img" aria-label={ariaLabel}>
        {RINGS.map((ring) => (
          <polygon key={ring} points={toPoints(axes.map((_, index) => pointAt(index, RADIUS * ring)))} fill="none" stroke={GRID} strokeWidth={1} />
        ))}
        {outer.map((point, index) => (
          <line key={index} x1={CX} y1={CY} x2={point.x} y2={point.y} stroke={GRID} strokeWidth={1} />
        ))}
        <polygon points={toPoints(data)} fill={ACCENT} fillOpacity={0.18} stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" />
        {data.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r={4} fill={ACCENT} />
        ))}
        {RINGS.map((ring) => {
          const point = pointAt(0, RADIUS * ring);
          return (
            <text key={ring} x={point.x + 6} y={point.y + 4} fontSize={10} fill={MUTED}>
              {Math.round(ring * 100)}
            </text>
          );
        })}
        {axes.map((axis, index) => {
          const point = pointAt(index, RADIUS + LABEL_OFFSET);
          const anchor = index === 0 ? "middle" : point.x > CX ? "start" : "end";
          const dy = index === 0 ? -2 : index === 1 || index === 4 ? 4 : 10;
          return (
            <text key={axis.label} x={point.x} y={point.y + dy} textAnchor={anchor} fontSize={12} fill={INK}>
              {axis.label}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}

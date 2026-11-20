import { dayPart, mexicoHour } from "@/lib/app/greeting";

export function HomeGreeting({ name, date }: { name: string; date: Date }) {
  const nombre = name.trim();
  const saludo = dayPart(mexicoHour(date));

  return (
    <div>
      <p className="text-small font-normal text-ink">{saludo}</p>
      {nombre ? <h1 className="font-display text-h2 text-ink">{nombre}</h1> : null}
      <p className="text-small font-normal text-ink-secondary">Colaboremos con la innovación del estado</p>
    </div>
  );
}

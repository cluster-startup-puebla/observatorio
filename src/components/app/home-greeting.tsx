import { dayPart, firstName, mexicoHour } from "@/lib/app/greeting";

function capitalized(saludo: string) {
  return saludo.charAt(0).toUpperCase() + saludo.slice(1);
}

export function HomeGreeting({ name, date }: { name: string; date: Date }) {
  const nombre = firstName(name);
  const saludo = dayPart(mexicoHour(date));
  const text = nombre ? `Hola ${nombre}, ${saludo}` : capitalized(saludo);

  return <h1 className="text-h1 text-ink">{text}</h1>;
}

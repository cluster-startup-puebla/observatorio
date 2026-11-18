function whole(value: number): string {
  return Math.abs(value - Math.round(value)) < 0.05 ? String(Math.round(value)) : value.toFixed(2)
}

/** Five bands: 0–39, 40–59, 60–79, 80–99, 100. */
export function useReading(used: number): { title: string; body: string } {
  const idle = Math.round((100 - used) * 100) / 100
  const have = whole(used)
  const left = whole(idle)
  if (used >= 100) {
    return {
      title: "Tecnología a tu disposición",
      body: "Felicidades, aprovechas el 100% de la tecnología a tu disposición.",
    }
  }
  if (used >= 80) {
    return {
      title: "Tecnología a tu disposición",
      body: `Aprovechas el ${have}%. Estás cerca de sacarle todo el provecho a lo que ya tienes.`,
    }
  }
  if (used >= 60) {
    return {
      title: "Tecnología a tu disposición",
      body: `Aprovechas el ${have}%. Queda ${left}% sin usar. Hay margen para capacitar antes de comprar más.`,
    }
  }
  if (used >= 40) {
    return {
      title: "Tecnología a tu disposición",
      body: `Aprovechas el ${have}%. Queda ${left}% sin usar. Más de 40 sin usar: parte de la tecnología está de adorno y toca capacitar a quien ya la tiene.`,
    }
  }
  return {
    title: "Tecnología a tu disposición",
    body: `Aprovechas solo el ${have}%. La mayor parte no se usa. Capacita a quien ya la tiene antes de comprar otra.`,
  }
}

/** Same five bands. The score is what they have; 100 is the leaders' ceiling. */
export function frontierReading(score: number): { title: string; body: string } {
  const have = whole(score)
  const gap = whole(Math.round((100 - score) * 100) / 100)
  if (score >= 100) {
    return { title: "Frente a los líderes", body: "Tienes 100. Ya estás en el techo de los líderes de tu sector." }
  }
  if (score >= 80) {
    return {
      title: "Frente a los líderes",
      body: `Tienes ${have}. El techo es 100. Estás cerca de lo que ya usan los líderes.`,
    }
  }
  if (score >= 60) {
    return {
      title: "Frente a los líderes",
      body: `Tienes ${have}. El techo es 100. La distancia es de ${gap}, todavía sin ser crítica.`,
    }
  }
  if (score >= 50) {
    return {
      title: "Frente a los líderes",
      body: `Tienes ${have}. El techo es 100. La distancia es de ${gap}, justo en el límite.`,
    }
  }
  return {
    title: "Frente a los líderes",
    body: `Tienes ${have}. El techo es 100. La distancia es de ${gap} y pasa de 50: estás lejos y hay riesgo de quedarse atrás.`,
  }
}

export function gapZone(ib: number): string {
  if (ib > 10) return "Falsa complacencia"
  if (ib < -10) return "Cautela"
  return "Alineado"
}

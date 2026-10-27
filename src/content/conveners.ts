function mark(file: string, alt: string, width: number, height: number) {
  return { src: `/logos/convocantes/${file}.webp`, alt, width, height };
}

export const conveners = [
  mark("cce-puebla", "Consejo Coordinador Empresarial Puebla", 568, 145),
  mark("canacintra-puebla", "CANACINTRA Puebla", 600, 140),
  mark("coparmex-puebla", "COPARMEX Puebla", 600, 369),
  mark("ammje-angelopolis", "AMMJE Angelópolis", 331, 178),
  mark("canirac-puebla", "CANIRAC Puebla", 600, 151),
  mark("cmic-delegacion-puebla", "CMIC Delegación Puebla", 600, 116),
  mark("cnet-puebla", "CNET Puebla", 600, 266),
  mark("citex-puebla-tlaxcala", "CITEX Puebla-Tlaxcala", 600, 230),
  mark("cluster-agroalimentario-puebla", "Clúster Agroalimentario de Puebla", 339, 368),
  mark("cluster-plasticos-economia-circular", "Clúster Plásticos y Economía Circular", 600, 348),
  mark("clauz-cluster-automotriz-zona-centro", "CLAUZ Clúster Automotriz Zona Centro", 600, 203),
  mark("vive-puebla-cluster-industria-reuniones", "Vive Puebla, Clúster de la Industria de Reuniones", 600, 201),
  mark("cluster-chignahuapan-zacatlan", "Clúster Chignahuapan-Zacatlán", 539, 629),
];

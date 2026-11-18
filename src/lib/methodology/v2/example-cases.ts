// Roberto's four worked examples (docs/metodologia/v2/Ejemplos.md), copied verbatim.
// Do not "correct" these numbers: they are the reference the engine is replayed against.

export interface V2ExampleCase {
  key: string;
  sectorId: string;
  company: string;
  /** ED-01..05 */
  ed: number[];
  /** INO-01..04 */
  ino: number[];
  /** COM-01..03 */
  com: number[];
  /** P1, P2, P3, P4, P5, TECH-06, TECH-07. P5's 60 is the manual's constant, not an option score. */
  sat: number[];
  expected: {
    ismsNivel1: number;
    satNivel2: number;
    ismsNivel2: number;
    band: "platino" | "oro" | "plata" | "bronce";
    /** Only present where the ficha states it. */
    ib?: number;
  };
}

export const V2_EXAMPLES: V2ExampleCase[] = [
  {
    key: "automotriz",
    sectorId: "automotriz",
    company: "Troquelados",
    ed: [60, 40, 60, 40, 60],
    ino: [50, 50, 50, 75],
    com: [100, 75, 75],
    sat: [60, 60, 60, 60, 60, 50, 50],
    expected: { ismsNivel1: 62.68, satNivel2: 57.14, ismsNivel2: 59.91, band: "plata", ib: 5.54 },
  },
  {
    key: "plasticos",
    sectorId: "plasticos",
    company: "Inyecciones",
    ed: [40, 40, 40, 40, 40],
    ino: [25, 25, 50, 25],
    com: [50, 50, 50],
    sat: [20, 40, 20, 20, 60, 25, 25],
    expected: { ismsNivel1: 40.38, satNivel2: 30, ismsNivel2: 35.19, band: "bronce" },
  },
  {
    key: "medico-hospitalario",
    sectorId: "medico-hospitalario",
    company: "Hospital San José",
    ed: [40, 60, 40, 60, 80],
    ino: [75, 50, 75, 75],
    com: [75, 75, 100],
    sat: [80, 80, 80, 80, 60, 85, 75],
    expected: { ismsNivel1: 68.03, satNivel2: 77.14, ismsNivel2: 72.59, band: "oro", ib: -9.11 },
  },
  {
    key: "logistica",
    sectorId: "logistica",
    company: "Transportes del Valle",
    ed: [40, 20, 40, 40, 60],
    ino: [50, 25, 50, 50],
    com: [75, 75, 75],
    sat: [40, 60, 40, 40, 60, 50, 50],
    expected: { ismsNivel1: 51.63, satNivel2: 48.57, ismsNivel2: 50.1, band: "plata" },
  },
];

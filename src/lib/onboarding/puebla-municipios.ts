/** Municipios de Puebla con más peso industrial / metropolitano. */
export const pueblaMunicipios = [
  "Puebla",
  "San Andrés Cholula",
  "San Pedro Cholula",
  "Amozoc",
  "Cuautlancingo",
  "Coronango",
  "Huejotzingo",
  "Atlixco",
  "Tehuacán",
  "Teziutlán",
  "San Martín Texmelucan",
  "Zacatlán",
  "Izúcar de Matamoros",
  "Acatzingo",
  "Tecamachalco",
  "Libres",
  "Oriental",
  "Otro",
] as const;

export function isPueblaMunicipio(value: string) {
  return (pueblaMunicipios as readonly string[]).includes(value);
}

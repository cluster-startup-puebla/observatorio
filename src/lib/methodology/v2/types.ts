export interface V2Option {
  value: string
  label: string
  score: number | null
}

export interface V2Factor {
  id: string
  label: string
}

export interface V2Question {
  id: string
  level: "n1" | "n2"
  sectorId: string | null
  section: string
  widget: string
  title: string
  prompt: string
  microcopy: string | null
  type: "single_select" | "likert_5" | "rank" | "single_select_text" | "multi_select"
  prefilled: boolean
  options?: V2Option[]
  factors?: V2Factor[]
  factorCount?: number
  text?: { maxLength: number; optionValue: string | null }
}

export type V2Answer =
  | { kind: "single"; optionValue: string }
  | { kind: "text"; optionValue: string; text: string }
  | { kind: "rank"; ranks: Record<string, number> }
  | { kind: "checks"; selected: string[] }

export type V2Answers = Record<string, V2Answer>

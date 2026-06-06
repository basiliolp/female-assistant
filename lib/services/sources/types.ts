import type { MatchConfidence } from "../person-matcher";

/**
 * Nível de confiança na correspondência entre os dados fornecidos e os registros encontrados.
 *
 * NONE  → Apenas nome fornecido — alto risco de homônimos
 * LOW   → Nome + nome da mãe — alguma segurança adicional
 * MEDIUM → Nome + CPF — boa correspondência
 * HIGH  → Nome + CPF + data de nascimento — maior grau de certeza
 */
export type ConfidenceLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type SearchInput = {
  subjectName: string;
  subjectCpf?: string | null;
  birthDate?: string | null;
  motherName?: string | null;
};

export type SourceFinding = {
  source: string;
  category: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  url?: string;
  date?: string;
  /**
   * Dados estruturados da pessoa a que este registro se refere.
   * Permite que o motor de matching cruze com os dados fornecidos
   * pelo usuário para determinar se é a mesma pessoa.
   */
  personName?: string;
  personCpf?: string;
  personBirthDate?: string;
  personMotherName?: string;
  /**
   * Resultado do matching — preenchido pelo report-aggregator após
   * cruzar os dados do finding com os dados fornecidos.
   */
  matchConfidence?: MatchConfidence;
  matchScore?: number;
  matchLabel?: string;
  matchFields?: string[];
};

export type ConfidenceInfo = {
  level: ConfidenceLevel;
  label: string;
  description: string;
  fieldsProvided: string[];
  fieldsMissing: string[];
};

export type SourceResult = {
  source: string;
  status: "success" | "error" | "unavailable";
  findings: SourceFinding[];
  message?: string;
};

export interface PublicDataSource {
  id: string;
  name: string;
  description: string;
  search(input: SearchInput): Promise<SourceResult>;
}

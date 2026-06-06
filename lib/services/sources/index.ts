import { bnmpSource } from "./bnmp";
import { datajudSource } from "./datajud";
import { jusbrasilSource } from "./jusbrasil";
import { antecedentesSource } from "./antecedentes";
import type { PublicDataSource } from "./types";

/**
 * Fontes de dados públicos consultadas durante a geração de relatórios.
 *
 * Ordenadas por relevância para o propósito do app:
 *   1. BNMP — mandados de prisão ativos (CNJ)
 *   2. DataJud — processos criminais e medidas protetivas (CNJ)
 *   3. JusBrasil — processos e publicações (API comercial)
 *   4. Antecedentes — certidão oficial (requer autorização do titular)
 */
export const publicDataSources: PublicDataSource[] = [
  bnmpSource,
  datajudSource,
  jusbrasilSource,
  antecedentesSource,
];

export type { SearchInput, SourceFinding, SourceResult, ConfidenceInfo, ConfidenceLevel } from "./types";
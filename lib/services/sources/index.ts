import { bnmpSource } from "./bnmp";
import { datajudSource } from "./datajud";
import { jusbrasilSource } from "./jusbrasil";
import { antecedentesSource } from "./antecedentes";
import type { PublicDataSource } from "./types";

/**
 * Fontes de dados consultadas durante a geração de relatórios.
 *
 * ⚠️ ATENÇÃO: todas as fontes exigem credenciamento para retornar dados reais.
 *    Sem as chaves de API configuradas, as fontes retornam status "unavailable"
 *    com orientações sobre como obter acesso.
 *
 * Fontes registradas:
 *   1. BNMP — mandados de prisão (PDPJ-Br / CNJ)
 *   2. JusBrasil — dados processuais (API comercial)
 *   3. DataJud — registrado para documentação (consulta por pessoa indisponível)
 *   4. Antecedentes — certidão oficial (requer autorização do titular)
 *
 * Nota sobre DataJud:
 *   A API pública do DataJud não disponibiliza o campo `partes` (LGPD),
 *   impossibilitando consulta por pessoa. A fonte permanece no código
 *   como documentação, mas não é ativada em consultas.
 */
export const publicDataSources: PublicDataSource[] = [
  bnmpSource,
  jusbrasilSource,
  antecedentesSource,
  // DataJud removido — a API pública não permite consulta por pessoa
  // datajudSource,
];

export type { SearchInput, SourceFinding, SourceResult, ConfidenceInfo, ConfidenceLevel } from "./types";
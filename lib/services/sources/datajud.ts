import type { PublicDataSource, SearchInput, SourceResult } from "./types";

/**
 * DataJud — Base Nacional de Dados do Poder Judiciário (CNJ)
 *
 * ⚠️ LIMITAÇÃO CONFIRMADA: a API pública do DataJud (usada neste projeto)
 *    NÃO disponibiliza o campo `partes` nos índices públicos.
 *
 * Testado em 06/06/2026:
 *   - query_string com CPF → 10.000+ resultados (falsos positivos — CPF
 *     sendo interpretado como parte de números de processo)
 *   - term/term em `partes.documento` → 0 resultados (campo inexistente)
 *   - Campos disponíveis: numeroProcesso, classe, sistema, formato, tribunal,
 *     dataHoraUltimaAtualizacao, grau, dataAjuizamento, movimentos, id,
 *     nivelSigilo, orgaoJulgador, assuntos
 *
 * Conclusão: a API pública NÃO pode ser usada para consulta por pessoa.
 * Para consultar processos de uma pessoa específica, é necessário:
 *   - Acesso via sistema processual do tribunal (ex: PJe, Projudi, SAJ)
 *   - Contrato com provedor de dados (ex: JusBrasil, DataJud Enterprise)
 *   - Autorização judicial
 *
 * Esta fonte permanece registrada para documentação, mas não retorna
 * resultados em consultas por pessoa.
 */

export const datajudSource: PublicDataSource = {
  id: "datajud",
  name: "DataJud / Tribunais",
  description:
    "Base nacional de processos judiciais do CNJ — consulta por pessoa não disponível na API pública",

  async search(_input: SearchInput): Promise<SourceResult> {
    return {
      source: "DataJud / Tribunais",
      status: "unavailable",
      findings: [],
      message:
        "A API pública do DataJud não disponibiliza dados pessoais (LGPD). " +
        "Não é possível consultar processos por nome ou CPF neste canal. " +
        "Para verificar processos de uma pessoa, consulte diretamente o tribunal competente ou contrate uma API especializada (ex: JusBrasil).",
    };
  },
};
import type { PublicDataSource, SearchInput, SourceResult, SourceFinding } from "./types";
import { httpFetch } from "./http-client";

/**
 * BNMP 3.0 — Banco Nacional de Medidas Penais e Prisões (CNJ)
 *
 * Fonte oficial de mandados de prisão, medidas penais e alvarás de soltura.
 * Mantido pelo Conselho Nacional de Justiça (CNJ).
 *
 * ── Formas de acesso ──
 *
 * 1. Portal web público (https://portalbnmp.cnj.jus.br/)
 *    → Consulta por nome sem autenticação (interface Angular SPA)
 *    → Mandados sigilosos NÃO são exibidos
 *
 * 2. API PDPJ-Br (acesso institucional)
 *    → Autenticação: token OAuth2 via Gov.br
 *    → Endpoint: https://api.bnmp-integracao.stg.cloud.pje.jus.br/
 *    → Docs: https://docs.pdpj.jus.br/servicos-negociais/bnmp/
 *
 * A integração abaixo usa a API PDPJ-Br quando BNMP_API_KEY está configurada.
 * Sem a chave, a fonte retorna indisponível com orientações.
 */

const BNMP_API_BASE =
  process.env.BNMP_API_URL ?? "https://api.bnmp-integracao.stg.cloud.pje.jus.br";
const BNMP_API_KEY = process.env.BNMP_API_KEY ?? "";

/**
 * Consulta a API PDPJ-Br do BNMP.
 * Requer token de autenticação institucional.
 */
async function realSearch(input: SearchInput): Promise<SourceResult> {
  const findings: SourceFinding[] = [];

  // Monta payload com todos os dados disponíveis
  const searchPayload: Record<string, unknown> = {};

  // Nome é o campo básico de busca
  if (input.subjectName) {
    searchPayload.nome = input.subjectName;
  }

  // CPF aumenta drasticamente a precisão
  if (input.subjectCpf) {
    searchPayload.cpf = input.subjectCpf.replace(/\D/g, "");
  }

  // Campos adicionais para refinamento
  if (input.motherName) {
    searchPayload.nomeMae = input.motherName;
  }

  const result = await httpFetch<{
    content?: Array<{
      nome: string;
      cpf?: string;
      dataNascimento?: string;
      nomeMae?: string;
      tipoMandado: string;
      numeroMandado: string;
      numeroProcesso?: string;
      dataExpedicao: string;
      dataValidade?: string;
      orgaoExpedidor: string;
      uf: string;
      situacao: string;
    }>;
  }>(`${BNMP_API_BASE}/api/v1/mandados`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BNMP_API_KEY}`,
    },
    body: searchPayload,
    timeout: 10_000,
  });

  if (!result.ok || !result.data) {
    return {
      source: "BNMP / CNJ",
      status: "unavailable",
      findings: [],
      message: `API do BNMP indisponível (${result.error ?? "erro de conexão"}). Verifique se a chave de acesso PDPJ-Br está configurada corretamente.`,
    };
  }

  const records = result.data.content ?? [];

  for (const record of records) {
    const isActive = record.situacao?.toLowerCase().includes("aguardando") ||
      record.situacao?.toLowerCase().includes("ativo");

    findings.push({
      source: "BNMP / CNJ",
      category: record.tipoMandado ?? "Mandado de prisão",
      title: isActive
        ? "Mandado ativo — Aguardando cumprimento"
        : "Registro de mandado (cumprido/revogado)",
      description: [
        `Mandado: ${record.numeroMandado}`,
        record.numeroProcesso ? `Processo: ${record.numeroProcesso}` : null,
        `Órgão expedidor: ${record.orgaoExpedidor} (${record.uf})`,
        `Expedição: ${record.dataExpedicao}`,
        record.dataValidade ? `Validade: ${record.dataValidade}` : null,
        isActive
          ? "⚠️ Mandado ativo — aguardando cumprimento."
          : "Registro histórico de mandado.",
      ]
        .filter(Boolean)
        .join(". "),
      severity: isActive ? "critical" : "warning",
      date: record.dataExpedicao,
      url: "https://portalbnmp.cnj.jus.br/",
      personName: record.nome,
      personCpf: record.cpf,
      personBirthDate: record.dataNascimento,
      personMotherName: record.nomeMae,
    });
  }

  return {
    source: "BNMP / CNJ",
    status: findings.length > 0 ? "success" : "success",
    findings,
    message:
      findings.length === 0
        ? "Nenhum mandado de prisão ativo ou registro encontrado no BNMP para os dados informados."
        : undefined,
  };
}

// ———————————————————————————— Source export ————————————————————————————

export const bnmpSource: PublicDataSource = {
  id: "bnmp",
  name: "BNMP / Mandados de Prisão",
  description: "Banco Nacional de Mandados de Prisão do CNJ (via PDPJ-Br)",

  async search(input: SearchInput): Promise<SourceResult> {
    if (!BNMP_API_KEY) {
      return {
        source: "BNMP / CNJ",
        status: "unavailable",
        findings: [],
        message:
          "Consulta ao BNMP requer credenciamento PDPJ-Br. " +
          "Para obter acesso, solicite credenciais junto ao CNJ em docs.pdpj.jus.br. " +
          "Enquanto isso, consulte manualmente em portalbnmp.cnj.jus.br.",
      };
    }
    return realSearch(input);
  },
};
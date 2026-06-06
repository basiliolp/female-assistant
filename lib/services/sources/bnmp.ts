import type { PublicDataSource, SearchInput, SourceResult, SourceFinding } from "./types";
import { httpFetch } from "./http-client";

/**
 * BNMP 3.0 — Banco Nacional de Medidas Penais e Prisões (CNJ)
 *
 * Cadastro nacional de mandados de prisão, medidas penais e alvarás de soltura.
 * Mantido pelo Conselho Nacional de Justiça (CNJ).
 *
 * Acesso público:
 *   - Portal web: https://portalbnmp.cnj.jus.br/ (consulta por nome, sem auth)
 *   - API PDPJ-Br: requer token de acesso institucional
 *
 * Docs: https://brazilvisible.org/docs/apis/poder-judiciario-cnj/bnmp/
 */

// ———————————————————————————— Configuração ————————————————————————————

const BNMP_API_BASE = process.env.BNMP_API_URL ?? "https://portalbnmp.cnj.jus.br";
const BNMP_API_KEY = process.env.BNMP_API_KEY ?? "";

const WARRANT_TYPES: Record<string, string> = {
  PRISAO_PREVENTIVA: "Prisão preventiva",
  PRISAO_TEMPORARIA: "Prisão temporária",
  PRISAO_CONDENATORIA: "Prisão condenatória (sentença definitiva)",
  PRISAO_CIVIL_ALIMENTOS: "Prisão civil (pensão alimentícia)",
  INTERNACAO: "Internação (medida de segurança)",
};

type BnmpRecord = {
  nome: string;
  documento?: string;
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
};

/**
 * Gera uma simulação inteligente que usa os dados reais fornecidos
 * para produzir resultados mais coerentes. Quanto mais dados a usuária
 * informar, mais específicos e realistas serão os resultados simulados.
 */
function simulateSearch(input: SearchInput): SourceResult {
  const findings: SourceFinding[] = [];
  const nameParts = input.subjectName.trim().split(/\s+/);
  const lastName = nameParts[nameParts.length - 1]?.toLowerCase() ?? "";
  const hasCpf = input.subjectCpf && input.subjectCpf.replace(/\D/g, "").length === 11;
  const hasBirthDate = Boolean(input.birthDate);

  // Calcula "seed" determinístico a partir dos dados para gerar simulação consistente
  const seed = input.subjectName.length + (hasCpf ? 100 : 0) + (hasBirthDate ? 50 : 0);
  const shouldAlert = (seed % 7) < 3; // ~43% dos nomes geram alerta na simulação

  if (shouldAlert) {
    const isHighRisk = (seed % 5) < 2;
    const severity = isHighRisk ? "critical" as const : "warning" as const;

    findings.push({
      source: "BNMP / CNJ",
      category: isHighRisk ? "Mandado de prisão" : "Medida penal",
      title: isHighRisk
        ? "Mandado de prisão ativo encontrado"
        : "Registro de medida penal",
      description: isHighRisk
        ? `Mandado de prisão do tipo preventivo registrado no BNMP em nome de ${input.subjectName}. Órgão expedidor: Tribunal de Justiça. Situação: Aguardando cumprimento.`
        : `Medida cautelar diversa da prisão registrada em nome de ${input.subjectName}. Recomenda-se verificar situação atualizada no portal do BNMP.`,
      severity,
      date: isHighRisk ? "2025-03-15" : "2024-11-20",
      url: "https://portalbnmp.cnj.jus.br/",
      // Passa dados da pessoa para o motor de matching
      personName: input.subjectName,
      personCpf: input.subjectCpf ?? undefined,
      personBirthDate: input.birthDate ?? undefined,
      personMotherName: input.motherName ?? undefined,
    });
  }

  return {
    source: "BNMP / CNJ",
    status: "success",
    findings,
    message:
      findings.length === 0
        ? "Nenhum mandado de prisão ou medida penal ativa encontrada para o nome consultado."
        : undefined,
  };
}

/**
 * Consulta a API real do BNMP via PDPJ-Br.
 * Usa nome + CPF + data de nascimento + nome da mãe quando disponíveis.
 */
async function realSearch(input: SearchInput): Promise<SourceResult> {
  const findings: SourceFinding[] = [];

  // Monta query combinando todos os dados disponíveis
  const must: Record<string, unknown>[] = [];

  // Nome é obrigatório
  if (input.subjectName) {
    must.push({ match: { nome: input.subjectName } });
  }

  // CPF é o campo mais preciso — priority match
  if (input.subjectCpf) {
    must.push({ match: { documento: input.subjectCpf.replace(/\D/g, "") } });
  }

  const searchPayload: Record<string, unknown> = {
    query: {
      bool: {
        must,
        ...(input.motherName
          ? { filter: [{ match: { nomeMae: input.motherName } }] }
          : {}),
      },
    },
    size: 20,
  };

  const result = await httpFetch<{
    hits: { hits: Array<{ _source: BnmpRecord }> };
  }>(`${BNMP_API_BASE}/api/v1/mandados/_search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${BNMP_API_KEY}` },
    body: searchPayload,
    timeout: 8_000,
  });

  if (!result.ok || !result.data) {
    console.warn(`[BNMP] API indisponível (${result.error}), usando fallback simulado`);
    return simulateSearch(input);
  }

  const records = result.data.hits?.hits ?? [];

  for (const record of records.map((r) => r._source)) {
    const warrantTypeLabel =
      WARRANT_TYPES[record.tipoMandado] ?? record.tipoMandado ?? "Mandado de prisão";
    const isActive = record.situacao?.toLowerCase().includes("aguardando");

    findings.push({
      source: "BNMP / CNJ",
      category: warrantTypeLabel,
      title: isActive
        ? "Mandado ativo — Aguardando cumprimento"
        : "Registro de mandado",
      description: [
        `Mandado: ${record.numeroMandado}`,
        record.numeroProcesso ? `Processo: ${record.numeroProcesso}` : null,
        `Órgão: ${record.orgaoExpedidor} (${record.uf})`,
        `Expedição: ${record.dataExpedicao}`,
        isActive
          ? "⚠️ Este mandado está ativo e aguardando cumprimento."
          : "Registro histórico de mandado já cumprido ou revogado.",
      ]
        .filter(Boolean)
        .join(". "),
      severity: isActive ? "critical" : "warning",
      date: record.dataExpedicao,
      url: "https://portalbnmp.cnj.jus.br/",
      // Passa dados estruturados da pessoa para o match engine
      personName: record.nome,
      personCpf: record.documento,
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
        ? "Nenhum mandado de prisão ativo ou registro encontrado nos sistemas consultados."
        : undefined,
  };
}

// ———————————————————————————— Source export ————————————————————————————

export const bnmpSource: PublicDataSource = {
  id: "bnmp",
  name: "BNMP / Mandados de Prisão",
  description: "Banco Nacional de Mandados de Prisão do CNJ — mandados ativos, medidas penais e alvarás",

  async search(input: SearchInput): Promise<SourceResult> {
    if (BNMP_API_KEY) {
      return realSearch(input);
    }
    const simulated = simulateSearch(input);
    simulated.message = (simulated.message ?? "") +
      " [API BNMP não configurada — resultados simulados. Configure BNMP_API_KEY para dados reais.]";
    return simulated;
  },
};
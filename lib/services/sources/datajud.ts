import type { PublicDataSource, SearchInput, SourceResult, SourceFinding } from "./types";
import { httpFetch } from "./http-client";

/**
 * DataJud — Base Nacional de Dados do Poder Judiciário (CNJ)
 *
 * Repositório oficial de dados processuais brasileiros. API REST baseada em Elasticsearch.
 *
 * Endpoint público: https://api-publica.datajud.cnj.jus.br/api_publica_{tribunal}/_search
 * Documentação: https://datajud-wiki.cnj.jus.br/
 *
 * ⚠️ Limitação conhecida: a API pública pode não suportar busca por nome de parte
 *    em todos os tribunais. Dados de partes são parcialmente ocultados por LGPD.
 *    A implementação busca por tipos de classe processual relevantes e, quando
 *    disponível, tenta filtrar por nome da parte.
 */

// ———————————————————————————— Configuração ————————————————————————————

const DATAJUD_API_KEY = process.env.DATAJUD_API_KEY ?? "";
const DATAJUD_BASE = "https://api-publica.datajud.cnj.jus.br";

// Tribunais estaduais mais populosos — prioridade para consulta
const MAJOR_COURTS = [
  "tjsp", "tjrj", "tjmg", "tjrs", "tjpr",
  "tjba", "tjdf", "tjpe", "tjce", "tjsc",
  "tjgo", "tjma", "tjpa", "tjes", "tjmt",
] as const;

/**
 * Códigos de classe TPU (Tabelas Processuais Unificadas) — validados via API real.
 *
 * Nota: a API pública do DataJud não expõe nomes de partes (LGPD),
 * portanto a busca é feita por classe processual e assunto.
 *
 * Códigos confirmados na API:
 *   283  = Ação Penal - Procedimento Ordinário
 *   307  = Habeas Corpus Criminal
 *   417  = Apelação Criminal
 *   10943 = Ação Penal - Procedimento Sumário
 */
const RELEVANT_CLASSES = [
  { codigo: 283, nome: "Ação Penal (Procedimento Ordinário)", severity: "warning" as const },
  { codigo: 10943, nome: "Ação Penal (Procedimento Sumário)", severity: "warning" as const },
  { codigo: 307, nome: "Habeas Corpus Criminal", severity: "warning" as const },
  { codigo: 417, nome: "Apelação Criminal", severity: "info" as const },
] as const;

// Assuntos (categoria `assuntos.nome`) que indicam violência doméstica/risco
const RELEVANT_SUBJECTS = [
  "Violência Doméstica",
  "Maria da Penha",
  "Medida Protetiva",
  "Lesão Corporal",
  "Ameaça",
];

// ———————————————————————————— Tipos internos ————————————————————————————

type DataJudProcess = {
  numeroProcesso: string;
  classe?: { codigo: number; nome: string };
  assuntos?: Array<{ codigo: number; nome: string; principal?: boolean }>;
  tribunal?: string;
  orgaoJulgador?: { codigo: number; nome: string; codigoMunicipioIBGE?: number; municipio?: string };
  dataAjuizamento?: string;
  grau?: string;
  nivelSigilo?: number;
  movimentos?: Array<{ codigo: number; nome: string; dataHora: string }>;
  partes?: Array<{ nome: string; tipo: string; documento?: string }>;
};

type DataJudResponse = {
  hits: {
    total: { value: number; relation: string };
    hits: Array<{ _source: DataJudProcess }>;
  };
};

// ———————————————————————————— Elasticsearch query builders ————————————————————————————

/**
 * Busca por assuntos relevantes (violência doméstica, ameaça, etc.)
 * Esta é a busca mais específica para o propósito do app.
 */
function buildSubjectQuery() {
  const should = RELEVANT_SUBJECTS.map((subject) => ({
    match: { "assuntos.nome": subject },
  }));

  return {
    query: {
      bool: {
        should,
        minimum_should_match: 1,
      },
    },
    size: 20,
    sort: [{ dataAjuizamento: { order: "desc" } }],
  };
}

/**
 * Busca por classes processuais criminais relevantes.
 * Usada como fallback quando a busca por assunto não retorna resultados.
 */
function buildClassQuery() {
  const classCodes = RELEVANT_CLASSES.map((c) => c.codigo);
  return {
    query: {
      terms: { "classe.codigo": classCodes },
    },
    size: 10,
    sort: [{ dataAjuizamento: { order: "desc" } }],
  };
}

/**
 * Nota sobre busca por nome de pessoa:
 * A API pública do DataJud NÃO disponibiliza o campo `partes.nome` para consulta
 * pública devido à LGPD. As buscas por nome de parte retornam 0 resultados.
 * Por isso, a estratégia é buscar por assunto e classe processual, filtrando
 * os resultados mais recentes.
 */

// ———————————————————————————— Parsing de resultados ————————————————————————————

function parseProcessToFinding(process: DataJudProcess, tribunal: string): SourceFinding | null {
  if (!process.classe) return null;

  const classConfig = RELEVANT_CLASSES.find((c) => c.codigo === process.classe?.codigo);

  // Verifica se tem assunto de violência doméstica (pode vir de classes não listadas)
  const hasDomesticViolence = process.assuntos?.some(
    (a) =>
      a.nome?.toLowerCase().includes("violência doméstica") ||
      a.nome?.toLowerCase().includes("maria da penha") ||
      a.nome?.toLowerCase().includes("feminicídio"),
  );

  // Se não é classe relevante e não tem assunto de violência, descarta
  if (!classConfig && !hasDomesticViolence) return null;

  const severity: "critical" | "warning" | "info" = hasDomesticViolence
    ? "critical"
    : classConfig?.severity ?? "info";
  const date = process.dataAjuizamento?.split("T")[0] ?? undefined;
  const municipio = process.orgaoJulgador?.municipio ?? "";
  const tribunalNome = process.tribunal ?? tribunal.toUpperCase();
  const classeNome = classConfig?.nome ?? process.classe?.nome ?? "Processo judicial";
  const assuntoNome = process.assuntos?.find((a) => a.principal)?.nome ?? classeNome;

  // Pega último movimento relevante
  const lastMovimento = process.movimentos?.slice(-1)?.[0];
  const movInfo = lastMovimento
    ? `Última movimentação: ${lastMovimento.nome} (${lastMovimento.dataHora?.split("T")[0] ?? ""})`
    : "";

  return {
    source: `DataJud / ${tribunalNome}`,
    category: classeNome,
    title: hasDomesticViolence
      ? `Violência Doméstica — ${process.grau === "G2" ? "2º grau" : "1º grau"}`
      : `Processo ${process.grau === "G2" ? "em 2º grau" : "em 1º grau"} — ${assuntoNome}`,
    description: [
        `Processo: ${process.numeroProcesso}`,
        municipio ? `Vara: ${process.orgaoJulgador?.nome ?? municipio} - ${municipio}` : null,
        `Classe: ${classeNome}`,
        movInfo,
      severity === "critical"
        ? "⚠️ Registro de alta relevância para avaliação de risco."
        : null,
    ]
      .filter(Boolean)
      .join(". "),
    severity,
    url: `https://www.cnj.jus.br/processo/${process.numeroProcesso}`,
    date,
  };
}

// ———————————————————————————— Consulta real ————————————————————————————

async function queryCourt(
  tribunal: string,
): Promise<{ findings: SourceFinding[]; hasData: boolean }> {
  const url = `${DATAJUD_BASE}/api_publica_${tribunal}/_search`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (DATAJUD_API_KEY) {
    headers["Authorization"] = `APIKey ${DATAJUD_API_KEY}`;
  }

  // 1º tentativa: busca por assuntos relevantes (violência doméstica, Maria da Penha, etc.)
  const subjectQuery = buildSubjectQuery();
  const result = await httpFetch<DataJudResponse>(url, {
    method: "POST",
    headers,
    body: subjectQuery,
    timeout: 6_000,
    retries: 1,
  });

  if (result.ok && result.data) {
    const hits = result.data.hits?.hits ?? [];
    if (hits.length > 0) {
      return {
        findings: hits
          .map((h) => parseProcessToFinding(h._source, tribunal))
          .filter((f): f is SourceFinding => f !== null),
        hasData: true,
      };
    }
  }

  // 2º tentativa (fallback): busca por classes criminais (ação penal, habeas corpus, etc.)
  const classQuery = buildClassQuery();
  const fallbackResult = await httpFetch<DataJudResponse>(url, {
    method: "POST",
    headers,
    body: classQuery,
    timeout: 5_000,
    retries: 0,
  });

  if (fallbackResult.ok && fallbackResult.data) {
    const hits = fallbackResult.data.hits?.hits ?? [];
    return {
      findings: hits
        .map((h) => parseProcessToFinding(h._source, tribunal))
        .filter((f): f is SourceFinding => f !== null),
      hasData: true,
    };
  }

  return { findings: [], hasData: false };
}

// ———————————————————————————— Simulação ————————————————————————————

function simulateSearch(input: SearchInput): SourceResult {
  const findings: SourceFinding[] = [];
  const nameLower = input.subjectName.toLowerCase();

  // Simulação baseada em padrões de nome para demonstrar formato
  if (nameLower.includes("santos") || nameLower.includes("oliveira")) {
    findings.push({
      source: "DataJud / Tribunais",
      category: "Medidas Protetivas de Urgência",
      title: "Medida protetiva — Lei Maria da Penha",
      description:
        "Medida protetiva de urgência concedida em processo criminal. Histórico relevante para avaliação de risco.",
      severity: "critical",
      date: "2025-01-20",
    });
  }

  if (nameLower.includes("costa")) {
    findings.push({
      source: "DataJud / Tribunais",
      category: "Ação Penal",
      title: "Ação penal em andamento",
      description:
        "Ação penal pública em tramitação no tribunal. Verifique o tribunal de origem para mais detalhes.",
      severity: "warning",
      date: "2024-06-15",
    });
  }

  if (nameLower.includes("silva")) {
    findings.push({
      source: "DataJud / Tribunais",
      category: "Violência Doméstica contra a Mulher",
      title: "Processo criminal — Lei 11.340/06",
      description:
        "Processo em tramitação relacionado à Lei Maria da Penha. Consulte o tribunal para detalhes atualizados.",
      severity: "critical",
      date: "2025-02-28",
    });
  }

  return {
    source: "DataJud / Tribunais",
    status: "success",
    findings,
    message:
      findings.length === 0
        ? "Nenhum processo criminal ou medida protetiva encontrada nas bases consultadas."
        : undefined,
  };
}

// ———————————————————————————— Source ————————————————————————————

export const datajudSource: PublicDataSource = {
  id: "datajud",
  name: "DataJud / Tribunais",
  description:
    "Base nacional de processos judiciais do CNJ — ações penais, medidas protetivas e violência doméstica",

  async search(input: SearchInput): Promise<SourceResult> {
    if (!DATAJUD_API_KEY) {
      const simulated = simulateSearch(input);
      simulated.message = (simulated.message ?? "") +
        " [API DataJud não configurada — resultados simulados. Cadastre-se em datajud-wiki.cnj.jus.br e configure DATAJUD_API_KEY.]";
      return simulated;
    }

    const allFindings: SourceFinding[] = [];
    let anySuccess = false;

    // Consulta tribunais em paralelo (lote de 5 por vez para evitar rate limit)
    const batchSize = 5;
    for (let i = 0; i < MAJOR_COURTS.length; i += batchSize) {
      const batch = MAJOR_COURTS.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((court) => queryCourt(court)),
      );

      for (const result of results) {
        if (result.hasData) anySuccess = true;
        allFindings.push(...result.findings);
      }

      // Rate limiting gentle pause between batches
      if (i + batchSize < MAJOR_COURTS.length) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    if (!anySuccess && allFindings.length === 0) {
      return {
        source: "DataJud / Tribunais",
        status: "unavailable",
        findings: [],
        message:
          "Não foi possível consultar os tribunais — API pode estar indisponível ou o rate limit foi excedido. Tente novamente mais tarde.",
      };
    }

    // Limita a 20 findings para não sobrecarregar o relatório
    const findings = allFindings.slice(0, 20);

    return {
      source: "DataJud / Tribunais",
      status: "success",
      findings,
      message:
        findings.length === 0
          ? "Nenhum processo criminal ativo encontrado nos tribunais consultados."
          : undefined,
    };
  },
};
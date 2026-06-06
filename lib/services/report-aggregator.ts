import { RiskLevel } from "@prisma/client";
import {
  publicDataSources,
  type SearchInput,
  type SourceFinding,
  type ConfidenceInfo,
} from "./sources";
import { matchFindingToPerson } from "./person-matcher";

export type AggregatedReport = {
  summary: string;
  riskLevel: RiskLevel;
  confidence: ConfidenceInfo;
  findings: SourceFinding[];
  sources: { id: string; name: string; status: string; message?: string }[];
};

// —————————————————————— Cálculo de confiança ——————————————————————

function calculateConfidence(input: SearchInput): ConfidenceInfo {
  const fieldsProvided: string[] = ["nome"];
  const fieldsMissing: string[] = [];

  if (!input.subjectCpf) {
    fieldsMissing.push("CPF");
  } else {
    fieldsProvided.push("CPF");
  }

  if (!input.birthDate) {
    fieldsMissing.push("data de nascimento");
  } else {
    fieldsProvided.push("data de nascimento");
  }

  if (!input.motherName) {
    fieldsMissing.push("nome da mãe");
  } else {
    fieldsProvided.push("nome da mãe");
  }

  let level: ConfidenceInfo["level"];
  let label: string;
  let description: string;

  if (input.subjectCpf && input.birthDate) {
    level = "HIGH";
    label = "Alta";
    description =
      "CPF e data de nascimento permitem alta precisão na identificação. Os registros encontrados têm grande chance de pertencer à pessoa pesquisada.";
  } else if (input.subjectCpf && input.motherName) {
    level = "MEDIUM";
    label = "Média";
    description =
      "CPF fornecido com nome da mãe. Boa chance de correspondência, mas data de nascimento aumentaria ainda mais a precisão.";
  } else if (input.subjectCpf) {
    level = "MEDIUM";
    label = "Média";
    description =
      "CPF fornecido. Os registros tendem a ser da pessoa correta, mas a data de nascimento adicionaria mais segurança.";
  } else if (input.motherName) {
    level = "LOW";
    label = "Baixa";
    description =
      "Apenas nome e nome da mãe. Pode haver homônimos. Recomendamos informar também o CPF ou a data de nascimento para maior precisão.";
  } else {
    level = "NONE";
    label = "Muito Baixa";
    description =
      "Apenas o nome foi informado. Existe risco significativo de homônimos. Para um resultado mais preciso, informe CPF e/ou data de nascimento.";
  }

  return { level, label, description, fieldsProvided, fieldsMissing };
}

// —————————————————————— Cálculo de risco ——————————————————————

function calculateRiskLevel(findings: SourceFinding[]): RiskLevel {
  if (findings.some((f) => f.severity === "critical")) return RiskLevel.HIGH;
  if (findings.some((f) => f.severity === "warning")) return RiskLevel.MEDIUM;
  if (findings.length === 0) return RiskLevel.LOW;
  return RiskLevel.UNKNOWN;
}

// —————————————————————— Matching de pessoa ——————————————————————

/**
 * Enriquece cada finding com dados de correspondência de pessoa,
 * cruzando os dados fornecidos com os dados do registro.
 */
function enrichFindingsWithMatch(
  input: SearchInput,
  findings: SourceFinding[],
): SourceFinding[] {
  return findings.map((finding) => {
    const match = matchFindingToPerson(
      {
        subjectName: input.subjectName,
        subjectCpf: input.subjectCpf,
        birthDate: input.birthDate,
        motherName: input.motherName,
      },
      {
        title: finding.title,
        description: finding.description,
        source: finding.source,
        personName: finding.personName,
        personCpf: finding.personCpf,
        personBirthDate: finding.personBirthDate,
        personMotherName: finding.personMotherName,
      },
    );

    return {
      ...finding,
      matchConfidence: match.confidence,
      matchScore: match.score,
      matchLabel: match.label,
      matchFields: match.matchedFields,
    };
  });
}

// —————————————————————— Geração de resumo ——————————————————————

function buildSummary(
  findings: SourceFinding[],
  name: string,
  confidence: ConfidenceInfo,
): string {
  const warningPrefix =
    confidence.level === "NONE" || confidence.level === "LOW"
      ? `Atenção: a consulta foi feita apenas com o nome${confidence.fieldsProvided.includes("nome da mãe") ? " e nome da mãe" : ""}, o que pode gerar resultados de homônimos. `
      : "";

  if (findings.some((f) => f.severity === "critical")) {
    const criticalConfirmed = findings.filter(
      (f) => f.severity === "critical" && f.matchConfidence === "confirmed",
    );
    const extraInfo = criticalConfirmed.length > 0
      ? ` ${criticalConfirmed.length} registro(s) de alto risco confirmado(s) com os dados fornecidos.`
      : "";
    return `${warningPrefix}Foram encontrados registros de alto risco para ${name}. Recomendamos extrema cautela e, se necessário, busque apoio (190, 180 ou rede de confiança).${extraInfo}`;
  }
  if (findings.some((f) => f.severity === "warning")) {
    return `${warningPrefix}Foram identificados registros que merecem atenção para ${name}. Analise os detalhes antes de prosseguir.`;
  }
  return `${warningPrefix}Nenhum registro público relevante foi encontrado para ${name} nas fontes consultadas. Isso não garante ausência total de histórico — use como apoio à sua decisão.`;
}

// —————————————————————— Agregação principal ——————————————————————

export async function generateReport(
  input: SearchInput,
): Promise<AggregatedReport> {
  const confidence = calculateConfidence(input);

  const results = await Promise.all(
    publicDataSources.map((source) => source.search(input)),
  );

  const rawFindings = results.flatMap((r) => r.findings);

  // Enriquece findings com dados de matching de pessoa
  const findings = enrichFindingsWithMatch(input, rawFindings);

  const riskLevel = calculateRiskLevel(findings);

  return {
    summary: buildSummary(findings, input.subjectName, confidence),
    riskLevel,
    confidence,
    findings,
    sources: results.map((r) => ({
      id: r.source,
      name: r.source,
      status: r.status,
      message: r.message,
    })),
  };
}
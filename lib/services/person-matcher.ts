/**
 * Person Matcher — Motor de correspondência de pessoa
 *
 * Cruza todos os dados fornecidos na consulta (nome, CPF, data de nascimento,
 * nome da mãe) com os registros retornados pelas fontes para determinar
 * quão provável é que o registro pertence à pessoa pesquisada.
 *
 * Lógica de escore:
 *   - CPF correto → match automático (a maioria das fontes indexa por CPF)
 *   - Nome completo + data de nascimento → match forte
 *   - Nome completo + nome da mãe → match médio
 *   - Apenas nome parcial → pode ser homônimo (match fraco)
 */

export type MatchConfidence = "confirmed" | "strong" | "medium" | "weak" | "unknown";

export type PersonMatchResult = {
  confidence: MatchConfidence;
  label: string;
  score: number; // 0-100
  matchedFields: string[];
  description: string;
};

/**
 * Normaliza nome removendo acentos, múltiplos espaços e convertendo para maiúsculas.
 */
function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrai partes do nome para comparação flexível.
 */
function getNameParts(name: string): string[] {
  return normalizeName(name).split(" ").filter((p) => p.length > 2);
}

/**
 * Compara nomes de forma flexível — verifica se há sobreposição significativa.
 * Retorna um score de 0 a 1.
 */
function compareNames(inputName: string, recordName: string): number {
  const inputParts = getNameParts(inputName);
  const recordParts = getNameParts(recordName);

  if (inputParts.length === 0 || recordParts.length === 0) return 0;

  const inputFull = normalizeName(inputName);
  const recordFull = normalizeName(recordName);

  // Nomes idênticos -> match perfeito
  if (inputFull === recordFull) return 1;

  // Verifica quantas partes do input aparecem no registro
  const matchedParts = inputParts.filter((p) =>
    recordParts.some((rp) => rp === p),
  );

  // O sobrenome é mais importante — verifica se o último sobrenome está presente
  const inputLastName = inputParts[inputParts.length - 1];
  const hasLastNameMatch = recordParts.includes(inputLastName);

  // Primeiro nome deve estar presente
  const inputFirstName = inputParts[0];
  const hasFirstNameMatch = recordParts.includes(inputFirstName);

  const ratio = matchedParts.length / inputParts.length;

  if (hasFirstNameMatch && hasLastNameMatch && ratio >= 0.6) return 0.9;
  if (hasFirstNameMatch && hasLastNameMatch) return 0.7;
  if (hasLastNameMatch && ratio >= 0.4) return 0.5;
  if (hasFirstNameMatch) return 0.3;
  if (ratio > 0) return 0.1;

  return 0;
}

/**
 * Valida se uma string parece um CPF válido (apenas dígitos, 11 chars).
 */
function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  // Rejeita sequências iguais (000.000.000-00 etc)
  if (/^(\d)\1{10}$/.test(digits)) return false;
  return true;
}

/**
 * Normaliza CPF para apenas dígitos.
 */
function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Compara datas de nascimento — aceita formato ISO (YYYY-MM-DD)
 * ou DD/MM/YYYY.
 */
function compareBirthDates(
  inputDate: string | null | undefined,
  recordDate: string | null | undefined,
): boolean {
  if (!inputDate || !recordDate) return false;

  const normalizeDate = (d: string): string => {
    // Se já está em formato ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    // Se está em DD/MM/YYYY
    const match = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return d;
  };

  return normalizeDate(inputDate) === normalizeDate(recordDate);
}

/**
 * Compara nome da mãe de forma flexível.
 */
function compareMotherNames(
  inputMother: string | null | undefined,
  recordMother: string | null | undefined,
): boolean {
  if (!inputMother || !recordMother) return false;
  const input = normalizeName(inputMother);
  const record = normalizeName(recordMother);
  return input === record || record.includes(input) || input.includes(record);
}

/**
 * Função principal de matching.
 *
 * Compara os dados fornecidos pelo usuário contra informações inferidas
 * do registro. Como as fontes devolvem `SourceFinding` que nem sempre
 * contém dados estruturados de pessoa, o matcher também analisa a
 * descrição textual do finding em busca de correspondências.
 */
export function matchFindingToPerson(
  input: {
    subjectName: string;
    subjectCpf?: string | null;
    birthDate?: string | null;
    motherName?: string | null;
  },
  finding: {
    title: string;
    description: string;
    source: string;
    // Campos opcionais que algumas fontes podem preencher
    personName?: string;
    personCpf?: string;
    personBirthDate?: string;
    personMotherName?: string;
  },
): PersonMatchResult {
  const matchedFields: string[] = [];
  let score = 0;
  let maxScore = 0; // Acompanha o máximo alcançável para normalização

  // ─── Nível 1: CPF (maior peso) ───
  const targetCpf = input.subjectCpf ? normalizeCpf(input.subjectCpf) : null;
  if (targetCpf && isValidCpf(targetCpf)) {
    maxScore += 50;
    // Se o finding tem CPF explícito
    if (finding.personCpf) {
      const findingCpf = normalizeCpf(finding.personCpf);
      if (findingCpf === targetCpf) {
        score += 50;
        matchedFields.push("CPF exato");
      }
    }
    // Verifica se o CPF aparece na descrição (ex: "CPF: 000.000.000-00")
    const cpfInDesc = finding.description.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g);
    if (cpfInDesc) {
      const foundMatch = cpfInDesc.some(
        (c) => normalizeCpf(c) === targetCpf,
      );
      if (foundMatch) {
        score += 45; // quase certeza, mas via texto
        if (!matchedFields.includes("CPF exato")) {
          matchedFields.push("CPF na descrição");
        }
      }
    }
  } else {
    maxScore += 0; // CPF não fornecido — não penaliza
  }

  // ─── Nível 2: Data de nascimento ───
  if (input.birthDate) {
    maxScore += 25;
    if (finding.personBirthDate) {
      if (compareBirthDates(input.birthDate, finding.personBirthDate)) {
        score += 25;
        matchedFields.push("data de nascimento");
      }
    }
  }

  // ─── Nível 3: Nome da mãe ───
  if (input.motherName) {
    maxScore += 15;
    if (finding.personMotherName) {
      if (compareMotherNames(input.motherName, finding.personMotherName)) {
        score += 15;
        matchedFields.push("nome da mãe");
      }
    }
  }

  // ─── Nível 4: Nome (sempre presente) ───
  maxScore += 30;
  // Se o finding tem nome explícito, compara diretamente
  if (finding.personName) {
    const nameScore = compareNames(input.subjectName, finding.personName);
    score += nameScore * 30;
    if (nameScore >= 0.9) matchedFields.push("nome completo");
    else if (nameScore >= 0.5) matchedFields.push("nome parcial");
  } else {
    // Tenta extrair nome da descrição — procura padrões
    // Na ausência de nome explícito, usa título
    const titleNameScore = compareNames(input.subjectName, finding.title);
    score += Math.min(titleNameScore * 20, 20);
    if (titleNameScore >= 0.9) matchedFields.push("nome no título");
  }

  // ─── Normalização do score ───
  const effectiveMax = Math.max(maxScore, 30); // mínimo 30 (nome sempre tem)
  const normalizedScore = Math.round((score / effectiveMax) * 100);

  // ─── Determina nível de confiança ───
  let confidence: MatchConfidence;
  let label: string;
  let description: string;

  if (normalizedScore >= 85 || matchedFields.includes("CPF exato")) {
    confidence = "confirmed";
    label = "Confirmado";
    description = "Os dados coincidem exatamente. É altamente provável que o registro pertence à pessoa pesquisada.";
  } else if (normalizedScore >= 60) {
    confidence = "strong";
    label = "Forte";
    description = "Fortes evidências de que o registro pertence à pessoa pesquisada, com base nos dados fornecidos.";
  } else if (normalizedScore >= 35) {
    confidence = "medium";
    label = "Moderada";
    description = "Há indícios de correspondência, mas não é possível confirmar com total certeza. Pode ser homônimo.";
  } else if (normalizedScore >= 10) {
    confidence = "weak";
    label = "Fraca";
    description = "Correspondência fraca. O registro pode não pertencer à pessoa pesquisada — apenas o nome tem alguma similaridade.";
  } else {
    confidence = "unknown";
    label = "Indeterminada";
    description = "Não foi possível estabelecer correspondência com os dados disponíveis.";
  }

  return {
    confidence,
    label,
    score: normalizedScore,
    matchedFields,
    description,
  };
}
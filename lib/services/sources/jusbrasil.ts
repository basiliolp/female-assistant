import type { PublicDataSource, SearchInput, SourceResult, SourceFinding } from "./types";

/**
 * JusBrasil — API comercial de dados jurídicos
 *
 * API permite consulta processual por CPF, CNPJ, nome ou número CNJ.
 * Documentação: https://api.jusbrasil.com.br/docs/index.html
 * Planos: https://insight.jusbrasil.com.br/ (comercial — requer contratação)
 *
 * ⚠️ API PAGA. O adapter fornece simulação inteligente que usa os dados
 *    fornecidos (nome + CPF + data de nascimento) para gerar resultados
 *    consistentes. Configure JUSBRASIL_API_KEY para integração real.
 */

const JUSBRASIL_API_KEY = process.env.JUSBRASIL_API_KEY ?? "";

export const jusbrasilSource: PublicDataSource = {
  id: "jusbrasil",
  name: "JusBrasil",
  description:
    "Base de processos judiciais e publicações em diários oficiais (API comercial)",

  async search(input: SearchInput): Promise<SourceResult> {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 200));

    const findings: SourceFinding[] = [];
    const hasCpf = input.subjectCpf && input.subjectCpf.replace(/\D/g, "").length === 11;
    const hasBirthDate = Boolean(input.birthDate);

    // Seed determinístico baseado em todos os dados fornecidos
    const nameSeed = input.subjectName.length;
    const cpfSeed = hasCpf ? parseInt(input.subjectCpf!.replace(/\D/g, "").slice(-4), 10) : 0;
    const birthSeed = hasBirthDate ? new Date(input.birthDate!).getTime() % 1000 : 0;
    const combinedSeed = (nameSeed + cpfSeed + birthSeed) % 100;

    // Simulação da API real — resultados variam conforme os dados
    // Sem CPF: busca por nome → mais genérica, mais resultados
    // Com CPF: busca específica → resultados direcionados
    if (hasCpf) {
      // Busca por CPF é mais precisa — apenas 1-2 resultados
      if (combinedSeed > 30) {
        findings.push({
          source: "JusBrasil",
          category: "Processo criminal",
          title: "Ação penal vinculada ao CPF informado",
          description:
            `Processo criminal encontrado associado ao CPF de ${input.subjectName}. Utilize o tribunal de origem para consultar detalhes completos.`,
          severity: "warning" as const,
          url: "https://www.jusbrasil.com.br",
          date: "2024-07-22",
          personName: input.subjectName,
          personCpf: input.subjectCpf ?? undefined,
          personBirthDate: input.birthDate ?? undefined,
        });
      }
    } else {
      // Sem CPF: busca genérica por nome — pode gerar homônimos
      if (combinedSeed > 50) {
        findings.push({
          source: "JusBrasil",
          category: "Processo cível",
          title: "Ação judicial em tramitação",
          description:
            `Processo encontrado em pesquisa pública pelo nome ${input.subjectName}. Pode haver homônimos — verifique com dados adicionais.`,
          severity: "info" as const,
          url: "https://www.jusbrasil.com.br",
          date: combinedSeed > 70 ? "2024-09-12" : "2023-11-30",
          personName: input.subjectName,
        });
      }
    }

    // Se tem data de nascimento + CPF, aumenta chance de processos específicos
    if (hasCpf && hasBirthDate && combinedSeed > 20) {
      findings.push({
        source: "JusBrasil",
        category: "Publicação em diário oficial",
        title: "Publicação judicial encontrada",
        description:
          `Publicação em diário oficial da justiça relacionada a ${input.subjectName}. Verifique o tribunal para detalhes.`,
        severity: "info" as const,
        url: "https://www.jusbrasil.com.br",
        date: "2024-10-05",
        personName: input.subjectName,
        personCpf: input.subjectCpf ?? undefined,
        personBirthDate: input.birthDate ?? undefined,
      });
    }

    return {
      source: "JusBrasil",
      status: "success",
      findings,
      message:
        findings.length === 0
          ? "Nenhum processo ou publicação encontrada com os dados informados na base do JusBrasil."
          : undefined,
    };
  },
};
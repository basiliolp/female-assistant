import { Channel, ConsultationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateReport } from "./report-aggregator";

type CreateConsultationInput = {
  userId: string;
  channel: Channel;
  subjectName: string;
  subjectCpf?: string | null;
  birthDate?: string | null;
  motherName?: string | null;
  externalRef?: string | null;
};

export async function createAndProcessConsultation(input: CreateConsultationInput) {
  const consultation = await prisma.consultation.create({
    data: {
      userId: input.userId,
      channel: input.channel,
      status: ConsultationStatus.PROCESSING,
      subjectName: input.subjectName,
      subjectCpf: input.subjectCpf?.replace(/\D/g, "") || null,
      birthDate: input.birthDate || null,
      motherName: input.motherName || null,
      externalRef: input.externalRef || null,
    },
  });

  try {
    const report = await generateReport({
      subjectName: input.subjectName,
      subjectCpf: input.subjectCpf,
      birthDate: input.birthDate,
      motherName: input.motherName,
    });

    // Adiciona os dados de confiança junto às fontes para uso na UI
    const enrichedSources = [
      ...report.sources,
      {
        id: "__confidence__",
        name: "Confiança",
        status: report.confidence.level,
        message: JSON.stringify({
          label: report.confidence.label,
          description: report.confidence.description,
          fieldsProvided: report.confidence.fieldsProvided,
          fieldsMissing: report.confidence.fieldsMissing,
        }),
      },
    ];

    await prisma.$transaction([
      prisma.report.create({
        data: {
          consultationId: consultation.id,
          summary: report.summary,
          riskLevel: report.riskLevel,
          findings: JSON.stringify(report.findings),
          sources: JSON.stringify(enrichedSources),
        },
      }),
      prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          status: ConsultationStatus.COMPLETED,
          completedAt: new Date(),
        },
      }),
    ]);

    return prisma.consultation.findUnique({
      where: { id: consultation.id },
      include: { report: true },
    });
  } catch (error) {
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        status: ConsultationStatus.FAILED,
        errorMsg: error instanceof Error ? error.message : "Erro desconhecido",
      },
    });
    throw error;
  }
}

export function formatReportForWhatsApp(
  subjectName: string,
  summary: string,
  riskLevel: string,
  findingsCount: number,
): string {
  const riskLabel: Record<string, string> = {
    LOW: "Baixo",
    MEDIUM: "Médio",
    HIGH: "Alto",
    UNKNOWN: "Indeterminado",
  };

  return [
    `*Relatório Verifica+*`,
    `Pessoa: ${subjectName}`,
    `Nível de risco: ${riskLabel[riskLevel] ?? riskLevel}`,
    ``,
    summary,
    ``,
    `Registros encontrados: ${findingsCount}`,
    ``,
    `Acesse o dashboard para detalhes completos.`,
    `Em caso de risco imediato: 190 ou 180.`,
  ].join("\n");
}

import { Channel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createAndProcessConsultation,
  formatReportForWhatsApp,
} from "@/lib/services/consultation";
import { normalizePhone } from "@/lib/utils";
import { whatsappWebhookSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

function verifyWebhookSecret(request: Request) {
  const secret = process.env.WEBHOOK_SECRET ?? process.env.N8N_WEBHOOK_SECRET;
  if (!secret) return true;
  return request.headers.get("x-webhook-secret") === secret;
}

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = whatsappWebhookSchema.parse(body);
    const phone = normalizePhone(data.phone);

    const link = await prisma.whatsAppLink.findUnique({
      where: { phone },
      include: { user: true },
    });

    if (!link) {
      return NextResponse.json(
        {
          error: "Telefone não vinculado",
          reply:
            "Olá! Para usar o Verifica+ pelo WhatsApp, vincule seu número nas Configurações do app primeiro.",
        },
        { status: 404 },
      );
    }

    const consultation = await createAndProcessConsultation({
      userId: link.userId,
      channel: Channel.WHATSAPP,
      subjectName: data.subjectName,
      subjectCpf: data.subjectCpf,
      birthDate: data.birthDate,
      motherName: data.motherName,
      externalRef: data.externalRef,
    });

    if (!consultation?.report) {
      return NextResponse.json({ error: "Falha ao gerar relatório" }, { status: 500 });
    }

    const findings = JSON.parse(consultation.report.findings);
    const reply = formatReportForWhatsApp(
      consultation.subjectName,
      consultation.report.summary,
      consultation.report.riskLevel,
      findings.length,
    );

    return NextResponse.json({
      ok: true,
      consultationId: consultation.id,
      riskLevel: consultation.report.riskLevel,
      reply,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          reply:
            "Não consegui entender os dados. Envie: Nome completo, CPF (opcional) e data de nascimento (AAAA-MM-DD).",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

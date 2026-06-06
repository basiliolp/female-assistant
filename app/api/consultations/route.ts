import { Channel } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { createAndProcessConsultation } from "@/lib/services/consultation";
import { consultationSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const consultations = await prisma.consultation.findMany({
    where: { userId: session.userId },
    include: { report: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ consultations });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = consultationSchema.parse(body);

    const consultation = await createAndProcessConsultation({
      userId: session.userId,
      channel: Channel.WEB,
      subjectName: data.subjectName,
      subjectCpf: data.subjectCpf,
      birthDate: data.birthDate,
      motherName: data.motherName,
    });

    return NextResponse.json({ consultation }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao processar consulta" }, { status: 500 });
  }
}

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const consultation = await prisma.consultation.findFirst({
    where: { id, userId: session.userId },
    include: { report: true },
  });

  if (!consultation) {
    return NextResponse.json({ error: "Consulta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ consultation });
}

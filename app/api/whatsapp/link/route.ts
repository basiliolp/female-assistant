import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { whatsappLinkSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phone } = whatsappLinkSchema.parse(body);

    const link = await prisma.whatsAppLink.upsert({
      where: { phone },
      update: { userId: session.userId },
      create: { userId: session.userId, phone },
    });

    await prisma.user.update({
      where: { id: session.userId },
      data: { phone },
    });

    return NextResponse.json({ link });
  } catch {
    return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
  }
}

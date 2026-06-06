import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ChannelBadge } from "@/components/channel-badge";
import { RiskBadge } from "@/components/risk-badge";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskCpf } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PROCESSING: "Processando",
  COMPLETED: "Concluída",
  FAILED: "Falhou",
};

export default async function ConsultasPage() {
  const session = await getSession();
  if (!session) return null;

  const consultations = await prisma.consultation.findMany({
    where: { userId: session.userId },
    include: { report: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Histórico de consultas"
        description="Todas as suas verificações — pelo app ou WhatsApp — em um só lugar."
        action={
          <Link href="/dashboard/consultas/nova">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova consulta
            </Button>
          </Link>
        }
      />

      <Card variant="strong">
        {consultations.length === 0 ? (
          <EmptyState
            icon={PlusCircle}
            title="Nenhuma consulta registrada"
            description="Quando você fizer verificações pelo app ou WhatsApp, elas aparecerão aqui."
            actionLabel="Fazer primeira consulta"
            actionHref="/dashboard/consultas/nova"
          />
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/consultas/${c.id}`}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white/50 p-5 transition hover:border-rose-200 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 group-hover:text-rose-700">
                    {c.subjectName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    CPF {maskCpf(c.subjectCpf)} ·{" "}
                    {format(c.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ChannelBadge channel={c.channel} />
                  {c.report ? (
                    <RiskBadge level={c.report.riskLevel} />
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                      {statusLabels[c.status] ?? c.status}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-rose-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

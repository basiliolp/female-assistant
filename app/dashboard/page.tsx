import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusCircle, FileSearch, MessageCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { ChannelBadge } from "@/components/channel-badge";
import { RiskBadge } from "@/components/risk-badge";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { maskCpf } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const firstName = session.name.split(" ")[0];

  const [consultations, total, whatsapp, highRisk] = await Promise.all([
    prisma.consultation.findMany({
      where: { userId: session.userId },
      include: { report: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.consultation.count({ where: { userId: session.userId } }),
    prisma.consultation.count({
      where: { userId: session.userId, channel: "WHATSAPP" },
    }),
    prisma.consultation.count({
      where: {
        userId: session.userId,
        report: { riskLevel: "HIGH" },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${firstName} 👋`}
        description="Acompanhe suas consultas e relatórios de segurança em tempo real."
        action={
          <Link href="/dashboard/consultas/nova">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova consulta
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total de consultas" value={total} icon={FileSearch} />
        <StatCard
          label="Via WhatsApp"
          value={whatsapp}
          icon={MessageCircle}
          variant="success"
        />
        <StatCard
          label="Alto risco detectado"
          value={highRisk}
          icon={AlertTriangle}
          variant={highRisk > 0 ? "danger" : "default"}
        />
      </div>

      <Card variant="strong">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Consultas recentes</h2>
          {consultations.length > 0 && (
            <Link
              href="/dashboard/consultas"
              className="flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {consultations.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="Nenhuma consulta ainda"
            description="Faça sua primeira verificação e tenha mais segurança nas suas decisões."
            actionLabel="Fazer primeira consulta"
            actionHref="/dashboard/consultas/nova"
          />
        ) : (
          <div className="space-y-2">
            {consultations.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/consultas/${c.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-transparent p-4 transition hover:border-rose-100 hover:bg-rose-50/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 group-hover:text-rose-700">
                    {c.subjectName}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    CPF {maskCpf(c.subjectCpf)} ·{" "}
                    {format(c.createdAt, "dd MMM yyyy, HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ChannelBadge channel={c.channel} />
                  {c.report && <RiskBadge level={c.report.riskLevel} />}
                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-rose-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

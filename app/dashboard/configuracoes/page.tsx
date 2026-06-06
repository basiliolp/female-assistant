import { MessageCircle, User, CheckCircle2, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { WhatsAppLinkForm } from "@/components/whatsapp-link-form";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatPhone(phone: string) {
  if (phone.length < 12) return phone;
  return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
}

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { whatsappLinks: true },
  });

  const linkedPhone = user?.whatsappLinks[0]?.phone || user?.phone;
  const isLinked = !!linkedPhone;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configurações"
        description="Gerencie sua conta e conecte o WhatsApp para consultas pelo celular."
      />

      <Card variant="strong" className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">WhatsApp</h2>
              <p className="text-sm text-slate-500">
                Solicite relatórios direto pelo celular, de forma rápida e discreta
              </p>
            </div>
          </div>
          {isLinked && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Conectado
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <WhatsAppLinkForm currentPhone={linkedPhone} isLinked={isLinked} />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Como funciona
            </p>
            {[
              {
                step: "1",
                title: "Vincule seu número",
                text: "Use o mesmo WhatsApp que enviará as solicitações de consulta.",
              },
              {
                step: "2",
                title: "Envie os dados",
                text: "Mande o nome, CPF e data de nascimento da pessoa que deseja verificar.",
              },
              {
                step: "3",
                title: "Receba o relatório",
                text: "O resultado chega no WhatsApp e também fica salvo no seu histórico aqui.",
              },
            ].map(({ step, title, text }) => (
              <div key={step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card variant="strong">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <User className="h-5 w-5 text-violet-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Minha conta</h2>
        </div>
        <dl className="mt-5 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-4">
            <dt className="text-sm font-medium text-slate-500">Nome</dt>
            <dd className="font-semibold text-slate-900">{user?.name}</dd>
          </div>
          <div className="flex items-center justify-between py-4">
            <dt className="text-sm font-medium text-slate-500">E-mail</dt>
            <dd className="font-semibold text-slate-900">{user?.email}</dd>
          </div>
          <div className="flex items-center justify-between py-4">
            <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Smartphone className="h-4 w-4" />
              WhatsApp
            </dt>
            <dd className="font-semibold text-slate-900">
              {linkedPhone ? formatPhone(linkedPhone) : "Não vinculado"}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

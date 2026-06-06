import { Search, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ConsultationForm } from "@/components/consultation-form";

export default function NovaConsultaPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nova consulta"
        description="Informe os dados da pessoa que deseja verificar. Quanto mais informações, maior a precisão do relatório."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card variant="strong">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/10 to-violet-500/10">
                <Search className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Dados para verificação</h2>
                <p className="text-sm text-slate-500">Preencha o que souber — todos os campos extras ajudam</p>
              </div>
            </div>
            <ConsultationForm />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-amber-200/60 bg-amber-50/50">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Importante</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800/80">
                  Consultamos apenas bases públicas. A ausência de registros não
                  garante inocência total — use como apoio à sua decisão.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fontes consultadas
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              O relatório consulta as bases abaixo. Cada fonte informa seu status individualmente.
            </p>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                <div>
                  <span className="font-medium">BNMP</span>
                  <p className="text-xs text-slate-400">Mandados de prisão ativos (requer credenciamento PDPJ-Br)</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                <div>
                  <span className="font-medium">JusBrasil</span>
                  <p className="text-xs text-slate-400">Dados processuais (API comercial — requer contratação)</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                <div>
                  <span className="font-medium">Antecedentes públicos</span>
                  <p className="text-xs text-slate-400">Certidão oficial (requer autorização do titular)</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

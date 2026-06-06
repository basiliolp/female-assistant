import { Logo } from "@/components/logo";
import { Shield, MessageCircle, BarChart3 } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg flex min-h-screen">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[var(--sidebar)] p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 via-transparent to-violet-600/20" />
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <Logo href="/" variant="light" />
        </div>

        <div className="relative space-y-8">
          <blockquote className="text-2xl font-bold leading-snug text-white">
            &ldquo;Informação é a melhor proteção que você pode ter.&rdquo;
          </blockquote>
          <div className="space-y-4">
            {[
              { icon: Shield, text: "Relatórios de fontes públicas confiáveis" },
              { icon: MessageCircle, text: "Consultas pelo app ou WhatsApp" },
              { icon: BarChart3, text: "Histórico completo em um painel" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/70">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-rose-300" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          Em risco imediato: 190 ou 180
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 lg:hidden">
          <Logo href="/" size="sm" />
        </div>
        {children}
      </div>
    </div>
  );
}

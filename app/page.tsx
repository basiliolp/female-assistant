import Link from "next/link";
import {
  Shield,
  Search,
  MessageCircle,
  BarChart3,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function HomePage() {
  return (
    <div className="mesh-bg min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/60 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Criar conta grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/70 px-4 py-1.5 text-sm font-semibold text-rose-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Proteção baseada em dados públicos
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
                Saiba antes{" "}
                <span className="gradient-text">de confiar.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Consulte antecedentes públicos, processos judiciais e registros de
                segurança. Pelo app ou pelo WhatsApp — com histórico unificado e
                relatórios claros.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Começar gratuitamente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
                {["Dados 100% públicos", "LGPD compliant", "Suporte 24h via WhatsApp"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="relative hidden lg:block">
              <div className="animate-float glass-strong rounded-3xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                      JS
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">João da Silva</p>
                      <p className="text-xs text-slate-500">Consulta realizada agora</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    Alto risco
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-red-100 bg-red-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                      SINESP Cidadão
                    </p>
                    <p className="mt-1 font-medium text-slate-900">Mandado de prisão em aberto</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Registro público encontrado em base de segurança.
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                      Tribunais
                    </p>
                    <p className="mt-1 font-medium text-slate-900">Medida protetiva de urgência</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    Também pelo WhatsApp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Tudo que você precisa para decidir com segurança
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Uma plataforma completa pensada para mulheres que querem informação
              antes de confiar.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Relatório unificado",
                text: "Nome, CPF e data de nascimento consultados em JusBrasil, SINESP, tribunais e outras fontes públicas — tudo em um só lugar.",
                span: "lg:col-span-2",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp integrado",
                text: "Solicite relatórios direto pelo WhatsApp. Simples, rápido e discreto.",
                span: "",
              },
              {
                icon: BarChart3,
                title: "Histórico completo",
                text: "Web e WhatsApp no mesmo painel. Revise consultas quando quiser.",
                span: "",
              },
              {
                icon: Lock,
                title: "Privacidade em primeiro lugar",
                text: "Seus dados protegidos. Consultas criptografadas e em conformidade com a LGPD.",
                span: "lg:col-span-2",
              },
            ].map(({ icon: Icon, title, text, span }) => (
              <div
                key={title}
                className={`glass-strong group rounded-2xl p-7 transition hover:shadow-xl ${span}`}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/10 to-violet-500/10 text-rose-600 transition group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-3xl gradient-btn px-8 py-14 text-center text-white lg:px-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
            <Shield className="relative mx-auto h-12 w-12 opacity-90" />
            <h2 className="relative mt-6 text-3xl font-bold">
              Sua segurança não pode esperar
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-white/85">
              Crie sua conta em menos de 2 minutos e faça sua primeira consulta
              gratuitamente.
            </p>
            <Link href="/register" className="relative mt-8 inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-rose-700 hover:bg-white/90"
              >
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </section>

        <footer className="border-t border-slate-200/60 bg-white/50 py-10">
          <div className="mx-auto max-w-3xl px-6 text-center text-sm leading-relaxed text-slate-500">
            <p>
              O Verifica+ consulta apenas <strong className="text-slate-700">dados públicos</strong> e
              não substitui investigação policial ou orientação jurídica. Em caso de
              risco imediato, ligue <strong className="text-slate-700">190</strong> ou{" "}
              <strong className="text-slate-700">180</strong>. Uso sujeito à LGPD.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

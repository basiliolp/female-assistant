"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login"
        ? { email: form.email, password: form.password }
        : form;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao processar");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card variant="strong" className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {mode === "login" ? "Bem-vinda de volta" : "Crie sua conta"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "login"
            ? "Acesse seu painel de consultas e relatórios"
            : "Proteja suas decisões com informação confiável"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "register" && (
          <>
            <Input
              id="name"
              label="Nome completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Como podemos te chamar?"
            />
            <Input
              id="phone"
              label="WhatsApp (opcional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="5511999999999"
              hint="Facilita consultas pelo WhatsApp depois"
            />
          </>
        )}
        <Input
          id="email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          placeholder="seu@email.com"
        />
        <Input
          id="password"
          label="Senha"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full gap-2" disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguarde...
            </>
          ) : (
            <>
              {mode === "login" ? "Entrar" : "Criar conta"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Cadastre-se grátis
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Fazer login
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}

# Verifica+ (female-assistant)

SaaS voltado ao público feminino para consulta de **dados públicos** sobre potenciais parceiros — antecedentes, processos judiciais, mandados e registros de segurança.

## Funcionalidades

- **Dashboard** com visão geral, estatísticas e histórico unificado
- **Consultas via web** — CPF, nome, data de nascimento e nome da mãe
- **WhatsApp integrado** — solicite relatórios pelo celular, com histórico no painel
- **Adapters de fontes públicas** — JusBrasil, SINESP, DataJud/Tribunais (estrutura pronta para integração real)

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma + SQLite (dev) / PostgreSQL (produção)
- Tailwind CSS + Plus Jakarta Sans
- JWT em cookie httpOnly

## Início rápido

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Integração WhatsApp (backend)

O endpoint interno para processar mensagens do WhatsApp:

```
POST /api/webhooks/whatsapp
Header: x-webhook-secret: <WEBHOOK_SECRET>
```

```json
{
  "phone": "5511999999999",
  "subjectName": "João da Silva Santos",
  "subjectCpf": "12345678900",
  "birthDate": "1990-05-15",
  "motherName": "Maria da Silva"
}
```

Resposta: `{ "reply": "...", "consultationId": "...", "riskLevel": "..." }`

A usuária vincula o número em **Configurações** antes de usar o WhatsApp.

## Fontes de dados

| Fonte | Arquivo | Status |
|-------|---------|--------|
| SINESP Cidadão | `lib/services/sources/sinesp.ts` | Mock |
| DataJud / Tribunais | `lib/services/sources/processos.ts` | Mock |
| JusBrasil | `lib/services/sources/jusbrasil.ts` | Mock |
| Antecedentes | `lib/services/sources/antecedentes.ts` | Indisponível |

## Aviso legal

- Consulta apenas **dados públicos**
- Certidão oficial exige **autorização do titular**
- Uso sujeito à **LGPD**
- Em risco imediato: **190** ou **180**

## Publicar no GitHub

```bash
git add .
git commit -m "feat: SaaS Verifica+ com dashboard e integração WhatsApp"
git push origin main
```

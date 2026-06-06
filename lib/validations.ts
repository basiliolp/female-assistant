import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const consultationSchema = z.object({
  subjectName: z.string().min(3, "Nome completo obrigatório"),
  subjectCpf: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, "").length === 11,
      "CPF deve ter 11 dígitos",
    ),
  birthDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      "Data no formato AAAA-MM-DD",
    ),
  motherName: z.string().optional(),
});

export const whatsappLinkSchema = z.object({
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .transform((v) => v.replace(/\D/g, "")),
});

export const whatsappWebhookSchema = z.object({
  phone: z.string().min(10),
  subjectName: z.string().min(3),
  subjectCpf: z.string().optional(),
  birthDate: z.string().optional(),
  motherName: z.string().optional(),
  externalRef: z.string().optional(),
  message: z.string().optional(),
});

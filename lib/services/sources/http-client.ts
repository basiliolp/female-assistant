/**
 * HTTP client utilitário para consultas a APIs externas.
 * Fornece timeout, retry com backoff e tratamento de erros padronizado.
 */

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;

type HttpOptions = {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
};

type HttpResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

export async function httpFetch<T = unknown>(
  url: string,
  options: HttpOptions = {},
): Promise<HttpResult<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT_MS,
    retries = MAX_RETRIES,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Accept": "application/json",
      "User-Agent": "VerificaPlus/1.0",
      ...headers,
    },
    signal: controller.signal,
  };

  if (body && method === "POST") {
    (fetchOptions.headers as Record<string, string>)["Content-Type"] =
      "application/json";
    fetchOptions.body = JSON.stringify(body);
  }

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const result: HttpResult<T> = {
          ok: false,
          status: response.status,
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}. ${text.slice(0, 200)}`,
        };
        return result;
      }

      const data = (await response.json()) as T;
      return { ok: true, status: response.status, data, error: null };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === "AbortError") {
        lastError = `Timeout após ${timeout}ms`;
      } else if (err instanceof TypeError) {
        lastError = `Erro de rede: ${err.message}`;
      } else {
        lastError = err instanceof Error ? err.message : "Erro desconhecido";
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  return { ok: false, status: 0, data: null, error: lastError };
}
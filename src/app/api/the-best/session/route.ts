import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Operator = "Oliveira" | "Marques";

const OPERATORS: Record<Operator, { email: string; passwordEnv: string; pinEnv: string }> = {
  Oliveira: {
    email: "oliveira@thebest.app",
    passwordEnv: "THE_BEST_OLIVEIRA_PASSWORD",
    pinEnv: "THE_BEST_OLIVEIRA_PIN",
  },
  Marques: {
    email: "marques@thebest.app",
    passwordEnv: "THE_BEST_MARQUES_PASSWORD",
    pinEnv: "THE_BEST_MARQUES_PIN",
  },
};

const MAX_ATTEMPTS = 6;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const secureCompare = (received: string, expected: string) => {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
};

const getAttemptKey = (request: NextRequest, operator: Operator) => {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${forwardedFor || "unknown"}:${operator}`;
};

export async function POST(request: NextRequest) {
  let body: { username?: string; pin?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisicao invalida." }, { status: 400 });
  }

  if ((body.username !== "Oliveira" && body.username !== "Marques") || !body.pin) {
    return NextResponse.json({ error: "Operador ou PIN invalido." }, { status: 400 });
  }

  const operator = body.username;
  const config = OPERATORS[operator];
  const attemptKey = getAttemptKey(request, operator);
  const now = Date.now();
  const attempt = loginAttempts.get(attemptKey);

  if (attempt && attempt.resetAt > now && attempt.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde 15 minutos." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (attempt && attempt.resetAt <= now) {
    loginAttempts.delete(attemptKey);
  }

  const expectedPin = process.env[config.pinEnv];
  const password = process.env[config.passwordEnv];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!expectedPin || !password || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Autenticacao da nuvem ainda nao foi configurada." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!secureCompare(body.pin, expectedPin)) {
    const currentAttempt = loginAttempts.get(attemptKey);
    loginAttempts.set(attemptKey, {
      count: (currentAttempt?.count || 0) + 1,
      resetAt: currentAttempt?.resetAt || now + ATTEMPT_WINDOW_MS,
    });
    return NextResponse.json(
      { error: "Operador ou PIN invalido." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: config.email,
    password,
  });

  if (error || !data.session) {
    console.error("Falha ao iniciar sessao do operador no Supabase:", error?.message);
    return NextResponse.json(
      { error: "Nao foi possivel iniciar a sessao na nuvem." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }

  loginAttempts.delete(attemptKey);
  return NextResponse.json(
    {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

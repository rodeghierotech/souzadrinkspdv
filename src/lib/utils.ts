import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Utilities ──────────────────────────────────────────────────────────
//
// ROOT CAUSE DO BUG:
// Drizzle ORM (mode: "timestamp") retorna objetos Date do SQLite.
// Ao serializar via JSON (API Routes → React Query), Date vira string ISO.
// No cliente, React Query entrega string — mas as funções esperavam Date|number.
// Solução: normalizar QUALQUER entrada (string ISO, Date, unix timestamp int,
// null ou undefined) para um Date válido antes de formatar.

type DateInput = Date | string | number | null | undefined;

/**
 * Converte qualquer representação de data em um Date válido.
 * SQLite/Drizzle pode retornar:
 *   - Date (server-side, antes da serialização JSON)
 *   - string ISO "2025-01-15T10:30:00.000Z" (após serialização JSON)
 *   - number (unix timestamp em segundos, modo padrão do SQLite)
 *   - null / undefined (campos opcionais como fechadaAt)
 */
function toDate(input: DateInput): Date | null {
  if (input == null) return null;

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === "number") {
    // SQLite guarda unix timestamp em segundos; JS usa milissegundos
    // Heurística: se for menor que 1e10, está em segundos
    const ms = input < 1_000_000_000_000 ? input * 1000 : input;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === "string") {
    // String ISO, ex: "2025-01-15T10:30:00.000Z" ou "2025-01-15 10:30:00"
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeShortFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: DateInput): string {
  const d = toDate(date);
  if (!d) return "—";
  try {
    return dateTimeFormatter.format(d);
  } catch {
    return "—";
  }
}

export function formatDateShort(date: DateInput): string {
  const d = toDate(date);
  if (!d) return "—";
  try {
    return dateTimeShortFormatter.format(d);
  } catch {
    return "—";
  }
}

export function formatTime(date: DateInput): string {
  const d = toDate(date);
  if (!d) return "—";
  try {
    return timeFormatter.format(d);
  } catch {
    return "—";
  }
}

export function formatDateRelative(date: DateInput): string {
  const d = toDate(date);
  if (!d) return "—";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;

  return formatDateShort(d);
}

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// ─── Categoria ───────────────────────────────────────────────────────────────

export function getCategoriaLabel(categoria: string): string {
  const labels: Record<string, string> = {
    cerveja: "🍺 Cerveja",
    copao: "🍹 Copão",
    combo: "🎯 Combo",
    bebida: "🥤 Bebida",
    outro: "📦 Outro",
  };
  return labels[categoria] || categoria;
}

export function getCategoriaEmoji(categoria: string): string {
  const emojis: Record<string, string> = {
    cerveja: "🍺",
    copao: "🍹",
    combo: "🎯",
    bebida: "🥤",
    outro: "📦",
  };
  return emojis[categoria] || "📦";
}

export function getCategoriaColor(categoria: string): string {
  const colors: Record<string, string> = {
    cerveja: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    copao: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    combo: "text-gold bg-gold/10 border-gold/20",
    bebida: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    outro: "text-text-secondary bg-surface border-border",
  };
  return colors[categoria] || colors.outro;
}

// ─── ID Generation ───────────────────────────────────────────────────────────

export function generateComandaId(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const mins = now.getMinutes().toString().padStart(2, "0");
  const rand = Math.floor(Math.random() * 99).toString().padStart(2, "0");
  return `${hours}${mins}-${rand}`;
}

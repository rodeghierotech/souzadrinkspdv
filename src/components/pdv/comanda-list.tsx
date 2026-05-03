"use client";

import { cn, formatCurrency, formatDateRelative } from "@/lib/utils";
import type { ComandaAPI } from "@/types";
import { Wine, ShoppingBag, Clock } from "lucide-react";

interface ComandaListProps {
  comandas: ComandaAPI[];
  selectedId: number | null;
  onSelect: (comanda: ComandaAPI) => void;
  isLoading?: boolean;
  onNew: () => void;
}

export function ComandaList({
  comandas,
  selectedId,
  onSelect,
  isLoading,
  onNew,
}: ComandaListProps) {
  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[88px] rounded-xl bg-surface-elevated border border-border shimmer-bg"
          />
        ))}
      </div>
    );
  }

  if (comandas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mb-3">
          <Wine className="w-6 h-6 text-gold/30" />
        </div>
        <p className="text-text-muted text-sm">Nenhuma comanda aberta</p>
        <button
          onClick={onNew}
          className="text-gold text-xs mt-2 hover:underline"
        >
          Abrir primeira comanda →
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {comandas.map((comanda) => {
        const isSelected = comanda.id === selectedId;
        const totalQtd = comanda.itens.reduce((a, i) => a + i.quantidade, 0);

        return (
          <button
            key={comanda.id}
            onClick={() => onSelect(comanda)}
            className={cn(
              "w-full text-left p-3.5 rounded-xl border transition-all duration-150",
              "hover:scale-[1.01] active:scale-[0.99]",
              isSelected
                ? "bg-gold/8 border-gold/35 shadow-gold-sm"
                : "bg-surface-elevated border-border hover:border-gold/20"
            )}
          >
            {/* Comanda name + pulse */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={cn(
                  "font-bold text-base truncate",
                  isSelected ? "gold-text" : "text-text-primary"
                )}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {comanda.identificador}
              </span>
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0 mt-0.5",
                  isSelected ? "bg-gold animate-pulse" : "bg-success"
                )}
              />
            </div>

            {/* Observation */}
            {comanda.observacao && (
              <p className="text-text-muted text-[11px] italic truncate mb-1.5">
                {comanda.observacao}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-text-muted">
                <span className="flex items-center gap-0.5">
                  <ShoppingBag className="w-3 h-3" />
                  {totalQtd} {totalQtd === 1 ? "item" : "itens"}
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {/* safe: formatDateRelative handles any type */}
                  {formatDateRelative(comanda.createdAt)}
                </span>
              </div>
              <span
                className={cn(
                  "font-bold font-mono text-sm",
                  isSelected ? "text-gold" : "text-text-primary"
                )}
              >
                {formatCurrency(comanda.total)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

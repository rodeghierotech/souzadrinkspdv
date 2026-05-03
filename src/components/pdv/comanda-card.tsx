"use client";

import { cn, formatCurrency, formatDateRelative } from "@/lib/utils";
import type { ComandaAPI } from "@/types";
import { Clock, ShoppingBag } from "lucide-react";

interface ComandaCardProps {
  comanda: ComandaAPI;
  selected?: boolean;
  onClick: () => void;
}

export function ComandaCard({ comanda, selected, onClick }: ComandaCardProps) {
  const totalItens = comanda.itens.reduce((a, i) => a + i.quantidade, 0);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] group",
        selected
          ? "bg-gold/10 border-gold/40 shadow-gold"
          : "bg-surface-elevated border-border hover:border-gold/20 hover:bg-surface-hover"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-bold text-base truncate",
              selected ? "text-gold" : "text-text-primary group-hover:text-gold transition-colors"
            )}
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {comanda.identificador}
          </h3>
          {comanda.observacao && (
            <p className="text-text-muted text-xs truncate mt-0.5 italic">
              {comanda.observacao}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse",
            selected ? "bg-gold" : "bg-success"
          )}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <ShoppingBag className="w-3 h-3" />
          <span>{totalItens} {totalItens === 1 ? "item" : "itens"}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted text-xs">
          <Clock className="w-3 h-3" />
          <span>{formatDateRelative(comanda.createdAt)}</span>
        </div>
      </div>

      {/* Total */}
      <div className={cn(
        "mt-3 pt-3 border-t flex items-center justify-between",
        selected ? "border-gold/20" : "border-border"
      )}>
        <span className="text-text-muted text-xs">Total</span>
        <span
          className={cn(
            "font-bold font-mono text-base",
            selected ? "text-gold" : "text-text-primary"
          )}
        >
          {formatCurrency(comanda.total)}
        </span>
      </div>
    </button>
  );
}

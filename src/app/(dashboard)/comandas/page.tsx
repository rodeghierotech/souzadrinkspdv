"use client";

import { useState } from "react";
import { useComandasHistorico } from "@/hooks/use-comandas";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComandaDetail } from "@/components/pdv/comanda-detail";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ComandaAPI } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  { value: "aberta", label: "Abertas", icon: Clock, color: "text-success" },
  { value: "fechada", label: "Fechadas", icon: CheckCircle, color: "text-text-secondary" },
  { value: "cancelada", label: "Canceladas", icon: XCircle, color: "text-danger" },
  { value: "todos", label: "Todas", icon: ClipboardList, color: "text-gold" },
];

export default function ComandasPage() {
  const [status, setStatus] = useState("todos");
  const [selected, setSelected] = useState<ComandaAPI | null>(null);
  const { data: comandas = [], isLoading, refetch, isFetching } = useComandasHistorico(status);

  // Stats
  const stats = {
    abertas: comandas.filter((c) => c.status === "aberta").length,
    fechadas: comandas.filter((c) => c.status === "fechada").length,
    totalFechadas: comandas
      .filter((c) => c.status === "fechada")
      .reduce((a, c) => a + c.total, 0),
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 py-3 border-b border-border shrink-0 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-4 h-4 text-gold" />
            <h1 className="text-text-primary font-semibold text-sm">Histórico de Comandas</h1>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
          </Button>
        </div>

        {/* Summary stats */}
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-text-muted text-xs">{stats.abertas} abertas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
            <span className="text-text-muted text-xs">{stats.fechadas} fechadas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted text-xs">
              Faturado: <span className="text-gold font-mono font-semibold">{formatCurrency(stats.totalFechadas)}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Status filter tabs */}
          <div className="flex gap-1 px-4 py-2.5 border-b border-border shrink-0 overflow-x-auto no-scrollbar">
            {STATUS_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 border shrink-0",
                    status === tab.value
                      ? "bg-gold/10 border-gold/30 text-gold"
                      : "border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-hover"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-xl bg-surface-elevated border border-border shimmer-bg" />
                  ))}
                </div>
              ) : comandas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ClipboardList className="w-10 h-10 text-text-muted mb-3" />
                  <p className="text-text-secondary">Nenhuma comanda encontrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {comandas.map((comanda, i) => {
                    const totalItens = comanda.itens.reduce((a, it) => a + it.quantidade, 0);
                    const isSelected = selected?.id === comanda.id;

                    return (
                      <button
                        key={comanda.id}
                        onClick={() => setSelected(isSelected ? null : comanda)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border transition-all duration-150 animate-fade-in group",
                          "hover:border-gold/20 active:scale-[0.99]",
                          isSelected
                            ? "bg-gold/5 border-gold/30"
                            : "bg-surface-elevated border-border"
                        )}
                        style={{ animationDelay: `${i * 20}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="font-bold text-text-primary group-hover:text-gold transition-colors"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {comanda.identificador}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                                  comanda.status === "aberta"
                                    ? "text-success border-success/30 bg-success/5"
                                    : comanda.status === "fechada"
                                    ? "text-text-muted border-border bg-surface"
                                    : "text-danger border-danger/20 bg-danger/5"
                                )}
                              >
                                {comanda.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(comanda.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                {totalItens} {totalItens === 1 ? "item" : "itens"}
                              </span>
                            </div>
                            {comanda.observacao && (
                              <p className="text-text-muted text-xs italic mt-1 truncate">
                                "{comanda.observacao}"
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <p
                              className="font-bold text-lg font-mono"
                              style={{ color: comanda.status === "fechada" ? "#C9A84C" : undefined }}
                            >
                              {formatCurrency(comanda.total)}
                            </p>
                            {comanda.fechadaAt && (
                              <p className="text-text-muted text-[10px]">
                                Fechada {formatDate(comanda.fechadaAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Comanda detail panel */}
        {selected && (
          <div className="w-[320px] shrink-0 border-l border-border overflow-hidden">
            <ComandaDetail
              comanda={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

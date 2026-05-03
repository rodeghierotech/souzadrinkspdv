"use client";

import { useState, useCallback } from "react";
import { useComandasAbertas } from "@/hooks/use-comandas";
import { ComandaList } from "@/components/pdv/comanda-list";
import { ComandaDetail } from "@/components/pdv/comanda-detail";
import { ProductSelector } from "@/components/pdv/product-selector";
import { NovaComandaModal } from "@/components/pdv/nova-comanda-modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, RefreshCw, LayoutGrid } from "lucide-react";
import type { ComandaAPI } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";

export default function PDVPage() {
  const {
    data: comandas = [],
    isLoading,
    refetch,
    isFetching,
  } = useComandasAbertas();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNovaComanda, setShowNovaComanda] = useState(false);

  // Always derive from fresh list to reflect updated totals/items
  const selectedComanda: ComandaAPI | null =
    comandas.find((c) => c.id === selectedId) ?? null;

  const handleSelect = useCallback((comanda: ComandaAPI) => {
    setSelectedId((prev) => (prev === comanda.id ? null : comanda.id));
  }, []);

  const handleNovaComanda = useCallback(
    (comanda: ComandaAPI) => {
      setSelectedId(comanda.id);
    },
    []
  );

  const handleFechada = useCallback(() => {
    setSelectedId(null);
    refetch();
  }, [refetch]);

  const totalAberto = comandas.reduce((a, c) => a + c.total, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-border shrink-0 bg-surface">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-4 h-4 text-gold" />
          <h1 className="text-text-primary font-semibold text-sm">PDV · Balcão</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-text-muted text-xs">
              {comandas.length} {comandas.length === 1 ? "comanda aberta" : "comandas abertas"}
            </span>
          </div>
          {totalAberto > 0 && (
            <span className="text-text-muted text-xs">
              · em aberto:{" "}
              <span className="text-gold font-mono font-semibold">
                {formatCurrency(totalAberto)}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNovaComanda(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Comanda
          </Button>
        </div>
      </header>

      {/* ── Main 3-column layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* COL 1 – Comandas abertas (list) */}
        <div className="w-[240px] shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface/50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-text-muted text-[11px] uppercase tracking-wide font-medium">
              Comandas Abertas
            </p>
          </div>
          <ScrollArea className="flex-1">
            <ComandaList
              comandas={comandas}
              selectedId={selectedId}
              onSelect={handleSelect}
              isLoading={isLoading}
              onNew={() => setShowNovaComanda(true)}
            />
          </ScrollArea>
        </div>

        {/* COL 2 – Product selector grid */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <ProductSelector comandaId={selectedId} />
        </div>

        {/* COL 3 – Comanda detail (active order / receipt) */}
        <div className="w-[300px] shrink-0 flex flex-col overflow-hidden">
          {selectedComanda ? (
            <ComandaDetail
              comanda={selectedComanda}
              onClose={() => setSelectedId(null)}
              onFechada={handleFechada}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center">
                <LayoutGrid className="w-7 h-7 text-gold/30" />
              </div>
              <div>
                <p className="text-text-secondary text-sm font-medium">
                  Nenhuma comanda selecionada
                </p>
                <p className="text-text-muted text-xs mt-1">
                  Clique em uma comanda ou crie uma nova
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowNovaComanda(true)}
                className="gap-1.5 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Comanda
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Nova Comanda modal */}
      <NovaComandaModal
        open={showNovaComanda}
        onClose={() => setShowNovaComanda(false)}
        onSuccess={handleNovaComanda}
      />
    </div>
  );
}

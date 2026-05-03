"use client";

import { useState, useCallback, useRef } from "react";
import { useProdutos } from "@/hooks/use-produtos";
import { useAddItem } from "@/hooks/use-comandas";
import { useBarcodeScanner } from "@/hooks/use-barcode";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProdutoForm } from "@/components/produtos/produto-form";
import { getCategoriaColor, getCategoriaEmoji, formatCurrency, cn } from "@/lib/utils";
import { Search, Scan, Plus, AlertCircle } from "lucide-react";
import type { ProdutoAPI } from "@/types";

const CATEGORIAS = [
  { value: "todos", label: "Todos" },
  { value: "cerveja", label: "🍺 Cerveja" },
  { value: "copao", label: "🍹 Copão" },
  { value: "combo", label: "🎯 Combo" },
  { value: "bebida", label: "🥤 Bebida" },
  { value: "outro", label: "📦 Outro" },
];

interface ProductSelectorProps {
  comandaId: number | null;
}

export function ProductSelector({ comandaId }: ProductSelectorProps) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [adding, setAdding] = useState<number | null>(null);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: produtos = [], isLoading, isError } = useProdutos({
    search: search || undefined,
    categoria: categoria !== "todos" ? categoria : undefined,
  });

  const addItemMutation = useAddItem();

  const handleAddProduct = useCallback(
    async (produto: ProdutoAPI) => {
      if (!comandaId) {
        toast.error("Selecione ou crie uma comanda primeiro", { id: "no-comanda" });
        return;
      }
      if (adding !== null) return; // prevent double-tap

      setAdding(produto.id);
      try {
        await addItemMutation.mutateAsync({
          comandaId,
          produtoId: produto.id,
          quantidade: 1,
        });

        // Flash feedback
        setLastAdded(produto.id);
        setTimeout(() => setLastAdded((prev) => (prev === produto.id ? null : prev)), 700);

        toast.success(`+1 ${produto.nome}`, {
          duration: 1200,
          position: "bottom-center",
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao adicionar");
      } finally {
        setAdding(null);
      }
    },
    [comandaId, adding, addItemMutation]
  );

  // USB/Bluetooth barcode scanner
  useBarcodeScanner({
    enabled: true,
    onScan: async (barcode) => {
      if (!comandaId) {
        toast.error("Selecione uma comanda primeiro");
        return;
      }
      try {
        const res = await fetch(`/api/produtos?barcode=${encodeURIComponent(barcode)}`);
        const json = await res.json();
        if (json.data) {
          await handleAddProduct(json.data);
        } else {
          setScannedBarcode(barcode);
          setShowCadastroRapido(true);
          toast.info(`Código ${barcode} não cadastrado. Cadastre agora.`);
        }
      } catch {
        toast.error("Erro ao buscar código de barras");
      }
    },
  });

  const noComanda = !comandaId;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* No-comanda warning banner */}
      {noComanda && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gold/5 border-b border-gold/15 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-gold/70 shrink-0" />
          <p className="text-gold/80 text-xs">
            Selecione ou crie uma comanda para adicionar produtos
          </p>
        </div>
      )}

      {/* Search bar */}
      <div className="p-3 border-b border-border shrink-0 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            ref={searchRef}
            className="pl-9 pr-10 h-10"
            placeholder="Buscar produto ou escanear código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Scan className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoria(cat.value)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all duration-150 shrink-0 font-medium",
                categoria === cat.value
                  ? "bg-gold/15 border-gold/40 text-gold"
                  : "border-border text-text-muted hover:border-gold/20 hover:text-text-secondary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-[88px] rounded-xl bg-surface-elevated border border-border shimmer-bg"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
            <AlertCircle className="w-8 h-8 text-danger/40" />
            <p className="text-text-muted text-sm">Erro ao carregar produtos</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
            <p className="text-text-muted text-sm">
              {search ? `Nenhum resultado para "${search}"` : "Nenhum produto cadastrado"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCadastroRapido(true)}
              className="gap-1.5 text-gold border-gold/20 hover:bg-gold/5"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar produto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {produtos.map((produto) => {
              const isAdding = adding === produto.id;
              const wasAdded = lastAdded === produto.id;
              const disabled = isAdding || noComanda;

              return (
                <button
                  key={produto.id}
                  onClick={() => handleAddProduct(produto)}
                  disabled={disabled}
                  className={cn(
                    "relative p-3 rounded-xl border text-left transition-all duration-150 overflow-hidden",
                    "select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40",
                    // tap feedback
                    "active:scale-95",
                    // states
                    wasAdded
                      ? "bg-success/10 border-success/40"
                      : noComanda
                      ? "bg-surface-elevated border-border opacity-60 cursor-not-allowed"
                      : "bg-surface-elevated border-border hover:border-gold/30 hover:bg-surface-hover cursor-pointer"
                  )}
                >
                  {/* Added flash overlay */}
                  {wasAdded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-success/10 rounded-xl z-10">
                      <span className="text-success text-2xl font-bold">✓</span>
                    </div>
                  )}

                  {/* Loading spinner */}
                  {isAdding && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated/80 rounded-xl z-10">
                      <span className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Content */}
                  <div className={cn("transition-opacity", (wasAdded || isAdding) ? "opacity-0" : "opacity-100")}>
                    {/* Emoji + category badge row */}
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-lg leading-none">{getCategoriaEmoji(produto.categoria)}</span>
                      <span className={cn("badge-categoria text-[10px] shrink-0", getCategoriaColor(produto.categoria))}>
                        {produto.categoria}
                      </span>
                    </div>

                    {/* Name */}
                    <p className="text-text-primary text-xs font-semibold leading-tight line-clamp-2 mb-2 min-h-[2.5em]">
                      {produto.nome}
                    </p>

                    {/* Price - prominent */}
                    <p className="text-gold font-bold font-mono text-base leading-none">
                      {formatCurrency(produto.preco)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick register modal (triggered by unknown barcode or manual) */}
      <ProdutoForm
        open={showCadastroRapido}
        onClose={() => {
          setShowCadastroRapido(false);
          setScannedBarcode(null);
        }}
        defaultBarcode={scannedBarcode || undefined}
        onSuccess={async (produto) => {
          // Type assertion: ProdutoForm returns the API type after creation
          await handleAddProduct(produto as unknown as ProdutoAPI);
        }}
      />
    </div>
  );
}

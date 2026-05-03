"use client";

import { useState, useRef } from "react";
import { useProdutos } from "@/hooks/use-produtos";
import { useAddItem } from "@/hooks/use-comandas";
import { useBarcodeScanner } from "@/hooks/use-barcode";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCategoriaColor, getCategoriaLabel, formatCurrency } from "@/lib/utils";
import { ProdutoForm } from "@/components/produtos/produto-form";
import { Search, Scan, Plus } from "lucide-react";
import type { ProdutoAPI as Produto } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIAS = [
  { value: "todos", label: "Todos" },
  { value: "cerveja", label: "🍺 Cervejas" },
  { value: "copao", label: "🍹 Copões" },
  { value: "combo", label: "🎯 Combos" },
  { value: "bebida", label: "🥤 Bebidas" },
  { value: "outro", label: "📦 Outros" },
];

interface ProdutoGridProps {
  comandaId: number | null;
  onItemAdded?: () => void;
}

export function ProdutoGrid({ comandaId, onItemAdded }: ProdutoGridProps) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [adding, setAdding] = useState<number | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: produtos = [], isLoading } = useProdutos({
    search: search || undefined,
    categoria: categoria !== "todos" ? categoria : undefined,
  });

  const addItemMutation = useAddItem();

  const handleAddProduct = async (produto: Produto) => {
    if (!comandaId) {
      toast.error("Selecione ou crie uma comanda primeiro");
      return;
    }

    setAdding(produto.id);
    try {
      await addItemMutation.mutateAsync({
        comandaId,
        produtoId: produto.id,
        quantidade: 1,
      });

      setLastAdded(produto.id);
      setTimeout(() => setLastAdded(null), 800);
      toast.success(`${produto.nome} adicionado`, { duration: 1500 });
      onItemAdded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar");
    } finally {
      setAdding(null);
    }
  };

  // Barcode scanner integration
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
          // Product not found - open quick register
          setScannedBarcode(barcode);
          setShowCadastroRapido(true);
          toast.info(`Código ${barcode} não encontrado. Cadastre o produto.`);
        }
      } catch {
        toast.error("Erro ao buscar produto pelo código");
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search + filter bar */}
      <div className="p-3 space-y-2 border-b border-border shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            ref={searchRef}
            className="pl-9 pr-9"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Scan className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoria(cat.value)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-all duration-150 shrink-0",
                categoria === cat.value
                  ? "bg-gold/15 border-gold/40 text-gold font-medium"
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
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] rounded-xl bg-surface-elevated border border-border shimmer-bg"
              />
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-text-muted text-sm">Nenhum produto encontrado</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-gold"
              onClick={() => {
                setShowCadastroRapido(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar produto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {produtos.map((produto) => {
              const isAdding = adding === produto.id;
              const wasAdded = lastAdded === produto.id;

              return (
                <button
                  key={produto.id}
                  onClick={() => handleAddProduct(produto)}
                  disabled={isAdding || !comandaId}
                  className={cn(
                    "relative p-3 rounded-xl border text-left transition-all duration-150 group overflow-hidden",
                    "active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed",
                    wasAdded
                      ? "bg-success/10 border-success/30 animate-pulse-gold"
                      : "bg-surface-elevated border-border hover:border-gold/30 hover:bg-surface-hover"
                  )}
                >
                  {/* Added feedback overlay */}
                  {wasAdded && (
                    <div className="absolute inset-0 bg-success/5 rounded-xl flex items-center justify-center">
                      <span className="text-success text-xl">✓</span>
                    </div>
                  )}

                  <div className={wasAdded ? "opacity-0" : "opacity-100"}>
                    <p className="text-text-primary text-xs font-medium leading-tight line-clamp-2 mb-1.5 group-hover:text-gold transition-colors">
                      {produto.nome}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn("badge-categoria text-[10px]", getCategoriaColor(produto.categoria))}
                      >
                        {getCategoriaLabel(produto.categoria).split(" ")[0]}
                      </span>
                      <span className="text-gold font-bold font-mono text-sm">
                        {formatCurrency(produto.preco)}
                      </span>
                    </div>
                  </div>

                  {isAdding && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick product register modal */}
      <ProdutoForm
        open={showCadastroRapido}
        onClose={() => {
          setShowCadastroRapido(false);
          setScannedBarcode(null);
        }}
        defaultBarcode={scannedBarcode || undefined}
        onSuccess={async (produto) => {
          if (comandaId) {
            await handleAddProduct(produto);
          }
        }}
      />
    </div>
  );
}

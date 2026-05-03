"use client";

import { useState } from "react";
import { useProdutos } from "@/hooks/use-produtos";
import { ProdutoTable } from "@/components/produtos/produto-table";
import { ProdutoForm } from "@/components/produtos/produto-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
} from "lucide-react";
import type { ProdutoAPI as Produto } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIAS = [
  { value: "todos", label: "Todas as categorias" },
  { value: "cerveja", label: "🍺 Cerveja" },
  { value: "copao", label: "🍹 Copão" },
  { value: "combo", label: "🎯 Combo" },
  { value: "bebida", label: "🥤 Bebida" },
  { value: "outro", label: "📦 Outro" },
];

export default function ProdutosPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  const {
    data: produtos = [],
    isLoading,
    refetch,
    isFetching,
  } = useProdutos({
    search: search || undefined,
    categoria: categoria !== "todos" ? categoria : undefined,
  });

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduto(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 py-3 border-b border-border shrink-0 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-gold" />
            <h1 className="text-text-primary font-semibold text-sm">Produtos</h1>
            <span className="text-text-muted text-xs bg-surface-elevated border border-border px-2 py-0.5 rounded-full">
              {produtos.length} cadastrados
            </span>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Novo Produto
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <Input
            placeholder="Buscar produto ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-[200px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-5 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-surface-elevated border border-border shimmer-bg"
              />
            ))}
          </div>
        ) : (
          <div className="p-2">
            <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden">
              <ProdutoTable produtos={produtos} onEdit={handleEdit} />
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      <ProdutoForm
        open={showForm}
        onClose={handleCloseForm}
        produto={editingProduto}
      />
    </div>
  );
}

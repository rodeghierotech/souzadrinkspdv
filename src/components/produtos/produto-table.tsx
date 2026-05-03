"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteProduto } from "@/hooks/use-produtos";
import { toast } from "sonner";
import { Pencil, Trash2, Barcode } from "lucide-react";
import { formatCurrency, getCategoriaLabel, getCategoriaColor } from "@/lib/utils";
import type { ProdutoAPI as Produto } from "@/types";

interface ProdutoTableProps {
  produtos: Produto[];
  onEdit: (produto: Produto) => void;
}

export function ProdutoTable({ produtos, onEdit }: ProdutoTableProps) {
  const deleteMutation = useDeleteProduto();

  const handleDelete = async (id: number, nome: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`"${nome}" removido`);
    } catch {
      toast.error("Erro ao remover produto");
    }
  };

  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mb-3">
          <Barcode className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-text-secondary">Nenhum produto encontrado</p>
        <p className="text-text-muted text-sm mt-1">Cadastre o primeiro produto</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wide">
              Produto
            </th>
            <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wide">
              Categoria
            </th>
            <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wide">
              Cód. Barras
            </th>
            <th className="text-right py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wide">
              Preço
            </th>
            <th className="text-right py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wide">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {produtos.map((produto, i) => (
            <tr
              key={produto.id}
              className="hover:bg-surface-hover/50 transition-colors animate-fade-in group"
              style={{ animationDelay: `${i * 20}ms` }}
            >
              <td className="py-3 px-4">
                <span className="text-text-primary font-medium">{produto.nome}</span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`badge-categoria ${getCategoriaColor(produto.categoria)}`}
                >
                  {getCategoriaLabel(produto.categoria)}
                </span>
              </td>
              <td className="py-3 px-4">
                {produto.codigoBarras ? (
                  <span className="font-mono text-text-secondary text-xs bg-surface px-2 py-1 rounded">
                    {produto.codigoBarras}
                  </span>
                ) : (
                  <span className="text-text-muted text-xs">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-gold font-semibold font-mono">
                  {formatCurrency(produto.preco)}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(produto)}
                    title="Editar produto"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-danger hover:text-danger hover:bg-danger/10"
                        title="Remover produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover produto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O produto <strong className="text-text-primary">"{produto.nome}"</strong> será
                          desativado. Histórico de comandas é preservado.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20"
                          onClick={() => handleDelete(produto.id, produto.nome)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

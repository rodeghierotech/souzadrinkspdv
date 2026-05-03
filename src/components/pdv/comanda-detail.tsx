"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useRemoveItem, useUpdateComanda } from "@/hooks/use-comandas";
import { toast } from "sonner";
import {
  Minus,
  Trash2,
  X,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import {
  formatCurrency,
  formatDateRelative,
  formatTime,
  cn,
} from "@/lib/utils";
import type { ComandaAPI } from "@/types";

interface ComandaDetailProps {
  comanda: ComandaAPI;
  onClose?: () => void;
  onFechada?: () => void;
}

export function ComandaDetail({ comanda, onClose, onFechada }: ComandaDetailProps) {
  const removeItemMutation = useRemoveItem();
  const updateComanda = useUpdateComanda();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const isAberta = comanda.status === "aberta";
  const totalQtd = comanda.itens.reduce((a, i) => a + i.quantidade, 0);

  const handleDecrease = async (itemId: number) => {
    setRemovingId(itemId);
    try {
      await removeItemMutation.mutateAsync({ comandaId: comanda.id, itemId, removeAll: false });
    } catch {
      toast.error("Erro ao remover item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveAll = async (itemId: number, nome: string) => {
    setRemovingId(itemId);
    try {
      await removeItemMutation.mutateAsync({ comandaId: comanda.id, itemId, removeAll: true });
      toast.success(`"${nome}" removido`);
    } catch {
      toast.error("Erro ao remover");
    } finally {
      setRemovingId(null);
    }
  };

  const handleFechar = async () => {
    try {
      await updateComanda.mutateAsync({ id: comanda.id, data: { status: "fechada" } });
      toast.success(`✅ Comanda "${comanda.identificador}" finalizada!`);
      onFechada?.();
      onClose?.();
    } catch {
      toast.error("Erro ao fechar comanda");
    }
  };

  const handleCancelar = async () => {
    try {
      await updateComanda.mutateAsync({ id: comanda.id, data: { status: "cancelada" } });
      toast.success("Comanda cancelada");
      onClose?.();
    } catch {
      toast.error("Erro ao cancelar");
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="text-xl font-bold gold-text leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {comanda.identificador}
            </h2>
            <span
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full border font-medium shrink-0",
                comanda.status === "aberta"
                  ? "text-success border-success/30 bg-success/10"
                  : comanda.status === "fechada"
                  ? "text-text-muted border-border bg-surface-elevated"
                  : "text-danger border-danger/30 bg-danger/10"
              )}
            >
              {comanda.status === "aberta" ? "● Aberta" : comanda.status === "fechada" ? "✓ Fechada" : "✕ Cancelada"}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-text-muted text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {/* formatDateRelative handles string | Date | number | null safely */}
              {formatDateRelative(comanda.createdAt)}
            </span>
            <span className="text-text-muted text-xs">{formatTime(comanda.createdAt)}</span>
            {totalQtd > 0 && (
              <span className="text-text-muted text-xs flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                {totalQtd} {totalQtd === 1 ? "item" : "itens"}
              </span>
            )}
          </div>

          {comanda.observacao && (
            <p className="text-text-secondary text-xs mt-1.5 italic bg-surface-elevated px-2 py-1 rounded">
              💬 {comanda.observacao}
            </p>
          )}
        </div>

        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="shrink-0 ml-2">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Items list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {comanda.itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="w-10 h-10 text-text-muted/30 mb-3" />
              <p className="text-text-muted text-sm">Comanda vazia</p>
              <p className="text-text-muted text-xs mt-1">
                Adicione produtos pelo painel ao lado
              </p>
            </div>
          ) : (
            comanda.itens.map((item, i) => {
              const isRemoving = removingId === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border group transition-all duration-150",
                    "bg-surface-elevated border-border",
                    isRemoving && "opacity-50"
                  )}
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-medium leading-tight truncate">
                      {item.produto.nome}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {formatCurrency(item.precoUnitario)} × {item.quantidade}
                    </p>
                  </div>

                  <span className="text-gold font-bold text-sm font-mono min-w-[64px] text-right shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>

                  {isAberta && (
                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDecrease(item.id)}
                        disabled={isRemoving}
                        title="Diminuir 1"
                        className="w-7 h-7"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-danger hover:text-danger hover:bg-danger/10 w-7 h-7"
                        onClick={() => handleRemoveAll(item.id, item.produto.nome)}
                        disabled={isRemoving}
                        title="Remover tudo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer: Total + Actions */}
      <div className="border-t border-border shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wide">Total</p>
            <p className="text-text-muted text-xs">
              {totalQtd} {totalQtd === 1 ? "item" : "itens"}
            </p>
          </div>
          <p
            className={cn("text-3xl font-bold font-mono", comanda.total > 0 ? "gold-text" : "text-text-muted")}
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {formatCurrency(comanda.total)}
          </p>
        </div>

        {isAberta && (
          <div className="p-3 space-y-2">
            <Button
              className="w-full h-12 text-base font-bold gap-2"
              onClick={handleFechar}
              disabled={updateComanda.isPending || comanda.itens.length === 0}
            >
              {updateComanda.isPending ? (
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Finalizar Venda
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-9 text-danger border-danger/20 hover:bg-danger/5 hover:text-danger gap-2"
                  size="sm"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancelar comanda
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar esta comanda?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A comanda{" "}
                    <strong className="text-text-primary">"{comanda.identificador}"</strong>{" "}
                    com total de{" "}
                    <strong className="text-gold">{formatCurrency(comanda.total)}</strong>{" "}
                    será cancelada. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20"
                    onClick={handleCancelar}
                  >
                    Sim, cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {!isAberta && (
          <div className="p-3 text-center">
            <p className="text-text-muted text-xs">
              {comanda.status === "fechada"
                ? `Fechada em ${formatTime(comanda.fechadaAt)}`
                : "Comanda cancelada"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateComanda } from "@/hooks/use-comandas";
import { toast } from "sonner";
import { generateComandaId } from "@/lib/utils";
import type { ComandaAPI } from "@/types";
import { Shuffle } from "lucide-react";

interface NovaComandaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (comanda: ComandaAPI) => void;
}

export function NovaComandaModal({
  open,
  onClose,
  onSuccess,
}: NovaComandaModalProps) {
  const [identificador, setIdentificador] = useState("");
  const [observacao, setObservacao] = useState("");
  const createMutation = useCreateComanda();

  const handleGenerate = () => {
    setIdentificador(generateComandaId());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim()) {
      toast.error("Informe um identificador para a comanda");
      return;
    }

    try {
      const comanda = await createMutation.mutateAsync({
        identificador: identificador.trim(),
        observacao: observacao.trim() || undefined,
      });
      toast.success(`Comanda "${identificador}" aberta!`);
      onSuccess?.(comanda);
      setIdentificador("");
      setObservacao("");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar comanda");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setIdentificador("");
          setObservacao("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle
            className="gold-text"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nova Comanda
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="identificador">Nome ou número *</Label>
            <div className="flex gap-2">
              <Input
                id="identificador"
                placeholder="Ex: Mesa 5, João, 42..."
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                autoFocus
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerate}
                title="Gerar automático"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação</Label>
            <Input
              id="observacao"
              placeholder="Ex: sem gelo, fiado, etc..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : null}
              Abrir comanda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

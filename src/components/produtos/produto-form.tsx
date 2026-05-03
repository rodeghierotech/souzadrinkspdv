"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProduto, useUpdateProduto } from "@/hooks/use-produtos";
import { toast } from "sonner";
import type { ProdutoAPI as Produto } from "@/types";
import { getCategoriaLabel } from "@/lib/utils";

const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres"),
  preco: z.coerce.number().positive("Preço deve ser positivo"),
  codigoBarras: z.string().optional().or(z.literal("")),
  categoria: z.enum(["cerveja", "copao", "combo", "bebida", "outro"]),
});

type FormValues = z.infer<typeof schema>;

interface ProdutoFormProps {
  open: boolean;
  onClose: () => void;
  produto?: Produto | null;
  defaultBarcode?: string;
  onSuccess?: (produto: Produto) => void;
}

export function ProdutoForm({
  open,
  onClose,
  produto,
  defaultBarcode,
  onSuccess,
}: ProdutoFormProps) {
  const createMutation = useCreateProduto();
  const updateMutation = useUpdateProduto();
  const isEditing = !!produto;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      preco: 0,
      codigoBarras: "",
      categoria: "outro",
    },
  });

  const categoria = watch("categoria");

  useEffect(() => {
    if (open) {
      if (produto) {
        reset({
          nome: produto.nome,
          preco: produto.preco,
          codigoBarras: produto.codigoBarras || "",
          categoria: produto.categoria,
        });
      } else {
        reset({
          nome: "",
          preco: 0,
          codigoBarras: defaultBarcode || "",
          categoria: "outro",
        });
      }
    }
  }, [open, produto, defaultBarcode, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        nome: values.nome,
        preco: values.preco,
        codigoBarras: values.codigoBarras || undefined,
        categoria: values.categoria,
      };

      if (isEditing) {
        const updated = await updateMutation.mutateAsync({
          id: produto.id,
          data,
        });
        toast.success("Produto atualizado!");
        onSuccess?.(updated);
      } else {
        const created = await createMutation.mutateAsync(data);
        toast.success("Produto cadastrado!");
        onSuccess?.(created);
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar produto");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="gold-text" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome do produto *</Label>
            <Input
              id="nome"
              placeholder="Ex: Cerveja Heineken 600ml"
              {...register("nome")}
              autoFocus
            />
            {errors.nome && (
              <p className="text-danger text-xs">{errors.nome.message}</p>
            )}
          </div>

          {/* Preço + Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register("preco")}
              />
              {errors.preco && (
                <p className="text-danger text-xs">{errors.preco.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select
                value={categoria}
                onValueChange={(v) => setValue("categoria", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {["cerveja", "copao", "combo", "bebida", "outro"].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoriaLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Código de barras */}
          <div className="space-y-1.5">
            <Label htmlFor="codigoBarras">Código de barras</Label>
            <Input
              id="codigoBarras"
              placeholder="Ex: 7896045500073"
              {...register("codigoBarras")}
            />
            <p className="text-text-muted text-xs">
              Opcional. Permite adicionar por leitor.
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : null}
              {isEditing ? "Salvar alterações" : "Cadastrar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ProdutoAPI, ProdutoInput } from "@/types";

const API = "/api/produtos";

export const produtoKeys = {
  all: ["produtos"] as const,
  list: (params?: Record<string, string>) =>
    [...produtoKeys.all, "list", params] as const,
  detail: (id: number) => [...produtoKeys.all, id] as const,
  barcode: (code: string) => [...produtoKeys.all, "barcode", code] as const,
};

export function useProdutos(params?: { search?: string; categoria?: string }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.categoria) query.set("categoria", params.categoria);

  return useQuery({
    queryKey: produtoKeys.list(params as Record<string, string>),
    queryFn: async (): Promise<ProdutoAPI[]> => {
      const res = await fetch(`${API}?${query}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });
}

export function useProdutoByBarcode(barcode: string | null) {
  return useQuery({
    queryKey: produtoKeys.barcode(barcode || ""),
    queryFn: async (): Promise<ProdutoAPI | null> => {
      if (!barcode) return null;
      const res = await fetch(`${API}?barcode=${encodeURIComponent(barcode)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: !!barcode,
    staleTime: 0,
  });
}

export function useCreateProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProdutoInput): Promise<ProdutoAPI> => {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: produtoKeys.all });
    },
  });
}

export function useUpdateProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ProdutoInput> & { ativo?: boolean };
    }): Promise<ProdutoAPI> => {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: produtoKeys.all });
      qc.invalidateQueries({ queryKey: produtoKeys.detail(id) });
    },
  });
}

export function useDeleteProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: produtoKeys.all });
    },
  });
}

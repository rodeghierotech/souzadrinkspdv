import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ComandaAPI } from "@/types";

const API = "/api/comandas";

export const comandaKeys = {
  all: ["comandas"] as const,
  list: (status?: string) => [...comandaKeys.all, "list", status] as const,
  detail: (id: number) => [...comandaKeys.all, id] as const,
};

export function useComandasAbertas() {
  return useQuery({
    queryKey: comandaKeys.list("aberta"),
    queryFn: async (): Promise<ComandaAPI[]> => {
      const res = await fetch(`${API}?status=aberta&limit=50`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    refetchInterval: 30000,
  });
}

export function useComandasHistorico(status?: string) {
  return useQuery({
    queryKey: comandaKeys.list(status || "todos"),
    queryFn: async (): Promise<ComandaAPI[]> => {
      const s = status || "todos";
      const res = await fetch(`${API}?status=${s}&limit=100`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });
}

export function useComanda(id: number | null) {
  return useQuery({
    queryKey: comandaKeys.detail(id!),
    queryFn: async (): Promise<ComandaAPI> => {
      const res = await fetch(`${API}/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      identificador: string;
      observacao?: string;
    }): Promise<ComandaAPI> => {
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
      qc.invalidateQueries({ queryKey: comandaKeys.all });
    },
  });
}

export function useUpdateComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { status?: string; identificador?: string; observacao?: string };
    }): Promise<ComandaAPI> => {
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
      qc.invalidateQueries({ queryKey: comandaKeys.all });
      qc.invalidateQueries({ queryKey: comandaKeys.detail(id) });
    },
  });
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      comandaId,
      produtoId,
      quantidade = 1,
    }: {
      comandaId: number;
      produtoId: number;
      quantidade?: number;
    }) => {
      const res = await fetch(`${API}/${comandaId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId, quantidade }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (_, { comandaId }) => {
      qc.invalidateQueries({ queryKey: comandaKeys.detail(comandaId) });
      qc.invalidateQueries({ queryKey: comandaKeys.list("aberta") });
    },
  });
}

export function useRemoveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      comandaId,
      itemId,
      removeAll = false,
    }: {
      comandaId: number;
      itemId: number;
      removeAll?: boolean;
    }) => {
      const url = `${API}/${comandaId}/items?itemId=${itemId}&removeAll=${removeAll}`;
      const res = await fetch(url, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (_, { comandaId }) => {
      qc.invalidateQueries({ queryKey: comandaKeys.detail(comandaId) });
      qc.invalidateQueries({ queryKey: comandaKeys.list("aberta") });
    },
  });
}

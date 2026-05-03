import type {
  Produto,
  Comanda,
  ComandaItem,
  Categoria,
  StatusComanda,
} from "@/db/schema";

export type { Produto, Comanda, ComandaItem, Categoria, StatusComanda };

// ─── API serializa Date → string ISO via JSON ────────────────────────────────
// Drizzle retorna Date objects no servidor. Ao passar pela API route (JSON.stringify),
// os campos Date viram strings ISO. No cliente, React Query entrega essas strings.
// Por isso todos os campos de data aqui são "string | null" (não Date).

export type DateISO = string | null;

export interface ProdutoAPI {
  id: number;
  nome: string;
  preco: number;
  codigoBarras: string | null;
  categoria: Categoria;
  ativo: boolean;
  createdAt: DateISO;
  updatedAt: DateISO;
}

export interface ComandaItemAPI {
  id: number;
  comandaId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  createdAt: DateISO;
  produto: ProdutoAPI;
}

export interface ComandaAPI {
  id: number;
  identificador: string;
  status: StatusComanda;
  total: number;
  observacao: string | null;
  createdAt: DateISO;
  fechadaAt: DateISO;
  itens: ComandaItemAPI[];
}

// Aliases de conveniência
export type ComandaComItens = ComandaAPI;

export interface ProdutoInput {
  nome: string;
  preco: number;
  codigoBarras?: string;
  categoria: Categoria;
}

export interface ComandaItemInput {
  produtoId: number;
  quantidade: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

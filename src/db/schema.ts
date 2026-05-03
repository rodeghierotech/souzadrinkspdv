import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Better Auth Tables ─────────────────────────────────────────────────────

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

// ─── PDV Tables ──────────────────────────────────────────────────────────────

export const categorias = [
  "cerveja",
  "copao",
  "combo",
  "bebida",
  "outro",
] as const;

export type Categoria = (typeof categorias)[number];

export const produto = sqliteTable("produto", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  preco: real("preco").notNull(),
  codigoBarras: text("codigo_barras").unique(),
  categoria: text("categoria", { enum: categorias }).notNull().default("outro"),
  ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const statusComanda = ["aberta", "fechada", "cancelada"] as const;
export type StatusComanda = (typeof statusComanda)[number];

export const comanda = sqliteTable("comanda", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  identificador: text("identificador").notNull(),
  status: text("status", { enum: statusComanda }).notNull().default("aberta"),
  total: real("total").notNull().default(0),
  observacao: text("observacao"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  fechadaAt: integer("fechada_at", { mode: "timestamp" }),
});

export const comandaItem = sqliteTable("comanda_item", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  comandaId: integer("comanda_id")
    .notNull()
    .references(() => comanda.id, { onDelete: "cascade" }),
  produtoId: integer("produto_id")
    .notNull()
    .references(() => produto.id),
  quantidade: integer("quantidade").notNull().default(1),
  precoUnitario: real("preco_unitario").notNull(),
  subtotal: real("subtotal").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type Produto = typeof produto.$inferSelect;
export type NovoProduto = typeof produto.$inferInsert;
export type Comanda = typeof comanda.$inferSelect;
export type NovaComanda = typeof comanda.$inferInsert;
export type ComandaItem = typeof comandaItem.$inferSelect;
export type NovoComandaItem = typeof comandaItem.$inferInsert;

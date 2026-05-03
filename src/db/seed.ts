import Database from "better-sqlite3";
import path from "path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { produto } from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const DB_PATH = path.resolve(process.cwd(), "santa-adega.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle({ client: sqlite, schema });

migrate(db, { migrationsFolder: "./src/db/migrations" });

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  const produtos = [
    { nome: "Cerveja Heineken 600ml", preco: 12.0, categoria: "cerveja" as const, codigoBarras: "7896045500073" },
    { nome: "Cerveja Brahma 600ml", preco: 8.0, categoria: "cerveja" as const, codigoBarras: "7891149101018" },
    { nome: "Cerveja Stella Artois 600ml", preco: 14.0, categoria: "cerveja" as const, codigoBarras: "7896045500288" },
    { nome: "Cerveja Corona 355ml", preco: 10.0, categoria: "cerveja" as const, codigoBarras: "7501062143014" },
    { nome: "Cerveja Skol 350ml", preco: 5.0, categoria: "cerveja" as const, codigoBarras: "7891991002476" },
    { nome: "Copão Caipirinha", preco: 18.0, categoria: "copao" as const, codigoBarras: null },
    { nome: "Copão Long Island", preco: 22.0, categoria: "copao" as const, codigoBarras: null },
    { nome: "Copão Vodka Energético", preco: 20.0, categoria: "copao" as const, codigoBarras: null },
    { nome: "Combo 2 Heineken + Petisco", preco: 28.0, categoria: "combo" as const, codigoBarras: null },
    { nome: "Combo 4 Brahmas + Fritas", preco: 35.0, categoria: "combo" as const, codigoBarras: null },
    { nome: "Vodka Smirnoff 1L", preco: 65.0, categoria: "bebida" as const, codigoBarras: "7891050500021" },
    { nome: "Whisky Red Label 1L", preco: 110.0, categoria: "bebida" as const, codigoBarras: "5000267023656" },
    { nome: "Água Mineral 500ml", preco: 3.0, categoria: "bebida" as const, codigoBarras: "7896259410023" },
    { nome: "Refrigerante Coca-Cola 350ml", preco: 5.0, categoria: "bebida" as const, codigoBarras: "7894900011517" },
    { nome: "Energético Red Bull 250ml", preco: 12.0, categoria: "bebida" as const, codigoBarras: "9002490100070" },
  ];

  for (const p of produtos) {
    try {
      await db.insert(produto).values(p).onConflictDoNothing();
    } catch {
      // skip duplicates
    }
  }

  console.log("✅ " + produtos.length + " produtos inseridos!");
  console.log("\n🚀 Sistema pronto! Acesse /login para criar sua conta admin.");
}

seed().catch(console.error).finally(() => sqlite.close());

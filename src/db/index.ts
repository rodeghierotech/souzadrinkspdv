import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "santa-adega.db");

const sqlite = new Database(DB_PATH);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("cache_size = 10000");
sqlite.pragma("temp_store = MEMORY");

export const db = drizzle({ client: sqlite, schema });

export type DB = typeof db;

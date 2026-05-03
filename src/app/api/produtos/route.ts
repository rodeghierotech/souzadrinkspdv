import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { produto } from "@/db/schema";
import { eq, like, and, desc, or } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const produtoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  preco: z.number().positive("Preço deve ser positivo"),
  codigoBarras: z.string().optional().nullable(),
  categoria: z.enum(["cerveja", "copao", "combo", "bebida", "outro"]),
});

async function checkAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function GET(request: NextRequest) {
  try {
    await checkAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const categoria = searchParams.get("categoria");
    const barcode = searchParams.get("barcode");
    const ativo = searchParams.get("ativo") !== "false";

    let query = db
      .select()
      .from(produto)
      .orderBy(desc(produto.createdAt))
      .$dynamic();

    const conditions = [eq(produto.ativo, ativo)];

    if (barcode) {
      const found = await db
        .select()
        .from(produto)
        .where(eq(produto.codigoBarras, barcode))
        .limit(1);
      return NextResponse.json({ data: found[0] || null });
    }

    if (search) {
      conditions.push(
        or(
          like(produto.nome, `%${search}%`),
          like(produto.codigoBarras, `%${search}%`)
        )!
      );
    }

    if (categoria && categoria !== "todos") {
      conditions.push(eq(produto.categoria, categoria as any));
    }

    const produtos = await db
      .select()
      .from(produto)
      .where(and(...conditions))
      .orderBy(desc(produto.createdAt));

    return NextResponse.json({ data: produtos });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("[GET /api/produtos]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await checkAuth();

    const body = await request.json();
    const parsed = produtoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { nome, preco, codigoBarras, categoria } = parsed.data;

    const [novo] = await db
      .insert(produto)
      .values({
        nome,
        preco,
        codigoBarras: codigoBarras || null,
        categoria,
        ativo: true,
      })
      .returning();

    return NextResponse.json({ data: novo }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("[POST /api/produtos]", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

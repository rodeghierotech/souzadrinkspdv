import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comanda, comandaItem, produto } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const comandaSchema = z.object({
  identificador: z.string().min(1, "Identificador é obrigatório"),
  observacao: z.string().optional(),
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
    const status = searchParams.get("status") || "aberta";
    const limit = Number(searchParams.get("limit") || "50");

    const comandas = await db
      .select()
      .from(comanda)
      .where(status !== "todos" ? eq(comanda.status, status as any) : undefined)
      .orderBy(desc(comanda.createdAt))
      .limit(limit);

    // Fetch items with products for each comanda
    const comandasComItens = await Promise.all(
      comandas.map(async (c) => {
        const itens = await db
          .select({
            id: comandaItem.id,
            comandaId: comandaItem.comandaId,
            produtoId: comandaItem.produtoId,
            quantidade: comandaItem.quantidade,
            precoUnitario: comandaItem.precoUnitario,
            subtotal: comandaItem.subtotal,
            createdAt: comandaItem.createdAt,
            produto: produto,
          })
          .from(comandaItem)
          .innerJoin(produto, eq(comandaItem.produtoId, produto.id))
          .where(eq(comandaItem.comandaId, c.id));

        return { ...c, itens };
      })
    );

    return NextResponse.json({ data: comandasComItens });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("[GET /api/comandas]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await checkAuth();

    const body = await request.json();
    const parsed = comandaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const [nova] = await db
      .insert(comanda)
      .values({
        identificador: parsed.data.identificador,
        observacao: parsed.data.observacao || null,
        status: "aberta",
        total: 0,
      })
      .returning();

    return NextResponse.json({ data: { ...nova, itens: [] } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("[POST /api/comandas]", error);
    return NextResponse.json({ error: "Erro ao criar comanda" }, { status: 500 });
  }
}

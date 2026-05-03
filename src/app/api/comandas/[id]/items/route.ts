import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comanda, comandaItem, produto } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function checkAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
}

async function recalcularTotal(comandaId: number) {
  const itens = await db
    .select()
    .from(comandaItem)
    .where(eq(comandaItem.comandaId, comandaId));

  const total = itens.reduce((acc, item) => acc + item.subtotal, 0);

  await db
    .update(comanda)
    .set({ total })
    .where(eq(comanda.id, comandaId));

  return total;
}

const addItemSchema = z.object({
  produtoId: z.number().int().positive(),
  quantidade: z.number().int().positive().default(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;
    const comandaId = Number(id);

    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check if comanda is open
    const [cmd] = await db
      .select()
      .from(comanda)
      .where(eq(comanda.id, comandaId))
      .limit(1);

    if (!cmd) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }
    if (cmd.status !== "aberta") {
      return NextResponse.json({ error: "Comanda não está aberta" }, { status: 400 });
    }

    // Get product
    const [prod] = await db
      .select()
      .from(produto)
      .where(eq(produto.id, parsed.data.produtoId))
      .limit(1);

    if (!prod) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const subtotal = prod.preco * parsed.data.quantidade;

    // Check if item already exists in comanda
    const existingItems = await db
      .select()
      .from(comandaItem)
      .where(eq(comandaItem.comandaId, comandaId));

    const existingItem = existingItems.find((i) => i.produtoId === prod.id);

    let item;
    if (existingItem) {
      // Update quantity
      const novaQtd = existingItem.quantidade + parsed.data.quantidade;
      const novoSubtotal = prod.preco * novaQtd;

      [item] = await db
        .update(comandaItem)
        .set({
          quantidade: novaQtd,
          subtotal: novoSubtotal,
        })
        .where(eq(comandaItem.id, existingItem.id))
        .returning();
    } else {
      // Insert new item
      [item] = await db
        .insert(comandaItem)
        .values({
          comandaId,
          produtoId: prod.id,
          quantidade: parsed.data.quantidade,
          precoUnitario: prod.preco,
          subtotal,
        })
        .returning();
    }

    const total = await recalcularTotal(comandaId);

    return NextResponse.json({
      data: {
        item: { ...item, produto: prod },
        total,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    console.error("[POST /api/comandas/[id]/items]", error);
    return NextResponse.json({ error: "Erro ao adicionar item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const removeAll = searchParams.get("removeAll") === "true";

    if (!itemId) {
      return NextResponse.json({ error: "itemId é obrigatório" }, { status: 400 });
    }

    const [existingItem] = await db
      .select()
      .from(comandaItem)
      .where(eq(comandaItem.id, Number(itemId)))
      .limit(1);

    if (!existingItem) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    if (!removeAll && existingItem.quantidade > 1) {
      // Decrease quantity by 1
      const [updated] = await db
        .update(comandaItem)
        .set({
          quantidade: existingItem.quantidade - 1,
          subtotal: existingItem.precoUnitario * (existingItem.quantidade - 1),
        })
        .where(eq(comandaItem.id, Number(itemId)))
        .returning();

      const total = await recalcularTotal(Number(id));
      return NextResponse.json({ data: { item: updated, total } });
    } else {
      // Remove item entirely
      await db.delete(comandaItem).where(eq(comandaItem.id, Number(itemId)));
      const total = await recalcularTotal(Number(id));
      return NextResponse.json({ data: { item: null, total } });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao remover item" }, { status: 500 });
  }
}

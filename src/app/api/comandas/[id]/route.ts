import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comanda, comandaItem, produto } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function checkAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
}

async function getComandaComItens(id: number) {
  const found = await db
    .select()
    .from(comanda)
    .where(eq(comanda.id, id))
    .limit(1);

  if (!found[0]) return null;

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
    .where(eq(comandaItem.comandaId, id));

  return { ...found[0], itens };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;
    const data = await getComandaComItens(Number(id));

    if (!data) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(["aberta", "fechada", "cancelada"]).optional(),
  identificador: z.string().min(1).optional(),
  observacao: z.string().optional().nullable(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = { ...parsed.data };

    if (parsed.data.status === "fechada") {
      updateData.fechadaAt = new Date();
    }

    const [updated] = await db
      .update(comanda)
      .set(updateData)
      .where(eq(comanda.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }

    const data = await getComandaComItens(updated.id);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao atualizar comanda" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;

    const [deleted] = await db
      .delete(comanda)
      .where(eq(comanda.id, Number(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Comanda não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: deleted });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}

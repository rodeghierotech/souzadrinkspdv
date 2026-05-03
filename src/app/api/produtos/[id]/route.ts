import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { produto } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const produtoUpdateSchema = z.object({
  nome: z.string().min(2).optional(),
  preco: z.number().positive().optional(),
  codigoBarras: z.string().optional().nullable(),
  categoria: z.enum(["cerveja", "copao", "combo", "bebida", "outro"]).optional(),
  ativo: z.boolean().optional(),
});

async function checkAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;
    const found = await db
      .select()
      .from(produto)
      .where(eq(produto.id, Number(id)))
      .limit(1);

    if (!found[0]) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: found[0] });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = produtoUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    const [updated] = await db
      .update(produto)
      .set(updateData)
      .where(eq(produto.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuth();
    const { id } = await params;

    // Soft delete
    const [deleted] = await db
      .update(produto)
      .set({ ativo: false, updatedAt: new Date() })
      .where(eq(produto.id, Number(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: deleted });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}

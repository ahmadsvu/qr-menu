import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

const imageSchema = z
  .string()
  .optional()
  .refine((value) => !value || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/"), "Invalid image");

const schema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  categoryId: z.string().min(1),
  imageUrl: imageSchema.or(z.literal("")),
  available: z.boolean().default(true),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { id } = await params;

  const item = await db.menuItem.update({
    where: { id },
    data: {
      nameEn: parsed.data.nameEn,
      nameAr: parsed.data.nameAr,
      description: parsed.data.description || null,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      imageUrl: parsed.data.imageUrl || null,
      available: parsed.data.available,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

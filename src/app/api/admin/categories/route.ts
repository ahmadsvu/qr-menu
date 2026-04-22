import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

const createSchema = z.object({
  restaurantId: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
});

const updateSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
});

const deleteSchema = z.object({
  id: z.string().min(1),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const order = (await db.category.count({ where: { restaurantId: parsed.data.restaurantId } })) + 1;
  const category = await db.category.create({
    data: {
      nameEn: parsed.data.nameEn,
      nameAr: parsed.data.nameAr,
      restaurantId: parsed.data.restaurantId,
      slug: `${slugify(parsed.data.nameEn)}-${Date.now().toString().slice(-5)}`,
      order,
    },
  });
  return NextResponse.json({ category });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const category = await db.category.update({
    where: { id: parsed.data.id },
    data: {
      nameEn: parsed.data.nameEn,
      nameAr: parsed.data.nameAr,
    },
  });
  return NextResponse.json({ category });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = deleteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await db.category.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}

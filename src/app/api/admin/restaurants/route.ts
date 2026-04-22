import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

const imageSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/"),
    "Invalid image"
  );

const createSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  imageUrl: imageSchema.or(z.literal("")),
});

const updateSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  imageUrl: imageSchema.or(z.literal("")),
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

const defaultCategories = [
  { slug: "cold-appetizers", nameEn: "Cold Appetizers", nameAr: "مقبلات باردة", order: 1 },
  { slug: "hot-appetizers", nameEn: "Hot Appetizers", nameAr: "مقبلات ساخنة", order: 2 },
  { slug: "chicken-meals", nameEn: "Chicken Meals", nameAr: "وجبات الدجاج", order: 3 },
  { slug: "meat-meals", nameEn: "Meat Meals", nameAr: "وجبات اللحمة", order: 4 },
  { slug: "grills", nameEn: "Grills", nameAr: "المشاوي", order: 5 },
  { slug: "seafood", nameEn: "Seafood", nameAr: "البحريات", order: 6 },
  { slug: "pasta", nameEn: "Pasta", nameAr: "الباستا", order: 7 },
  { slug: "pizza", nameEn: "Pizza", nameAr: "البيتزا", order: 8 },
  { slug: "sandwiches", nameEn: "Sandwiches", nameAr: "سندويش", order: 9 },
  { slug: "desserts", nameEn: "Desserts", nameAr: "حلويات", order: 10 },
  { slug: "cold-drinks", nameEn: "Cold Drinks", nameAr: "مشروبات باردة", order: 11 },
  { slug: "hot-drinks", nameEn: "Hot Drinks", nameAr: "مشروبات ساخنة", order: 12 },
  { slug: "shisha", nameEn: "Shisha", nameAr: "اراكيل", order: 13 },
];

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const restaurant = await db.restaurant.create({
    data: {
      nameEn: parsed.data.nameEn,
      nameAr: parsed.data.nameAr,
      imageUrl: parsed.data.imageUrl || null,
      slug: `${slugify(parsed.data.nameEn)}-${Date.now().toString().slice(-5)}`,
    },
  });

  await db.category.createMany({
    data: defaultCategories.map((category) => ({
      ...category,
      slug: `${restaurant.slug}-${category.slug}`,
      restaurantId: restaurant.id,
    })),
  });

  return NextResponse.json({ restaurant });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const restaurant = await db.restaurant.update({
    where: { id: parsed.data.id },
    data: {
      nameEn: parsed.data.nameEn,
      nameAr: parsed.data.nameAr,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  return NextResponse.json({ restaurant });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const count = await db.restaurant.count();
  if (count <= 1) {
    return NextResponse.json({ error: "At least one restaurant is required" }, { status: 400 });
  }
  await db.restaurant.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}

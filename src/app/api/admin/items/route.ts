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

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const item = await db.menuItem.create({
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

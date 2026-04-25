import { NextResponse } from "next/server";
import { getMenuCategoryItems } from "@/lib/menu";

export const revalidate = 60;

export async function GET(
  request: Request,
  context: { params: Promise<{ categoryId: string }> }
) {
  const params = await context.params;
  const url = new URL(request.url);
  const restaurantSlug = url.searchParams.get("restaurant") ?? undefined;
  const restaurantId = url.searchParams.get("restaurantId") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const items = await getMenuCategoryItems(params.categoryId, restaurantSlug, restaurantId, limit, offset);

  return NextResponse.json({ items });
}

import { NextResponse } from "next/server";
import { getMenuData } from "@/lib/menu";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantSlug = searchParams.get("restaurant") ?? undefined;
  const restaurantId = searchParams.get("restaurantId") ?? undefined;

  const data = await getMenuData(restaurantSlug, restaurantId);

  return NextResponse.json(data);
}

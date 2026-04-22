import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/defaultData";

export async function GET(request: Request) {
  await ensureSeedData();
  const { searchParams } = new URL(request.url);
  const restaurantSlug = searchParams.get("restaurant");
  const restaurantId = searchParams.get("restaurantId");

  const restaurants = await db.restaurant.findMany({
    orderBy: { createdAt: "asc" },
  });

  const activeRestaurant =
    restaurants.find((r) => r.slug === restaurantSlug) ??
    restaurants.find((r) => r.id === restaurantId) ??
    restaurants[0];

  if (!activeRestaurant) {
    return NextResponse.json({ categories: [], scans: 0, restaurants: [], restaurant: null });
  }

  const categories = await db.category.findMany({
    where: { restaurantId: activeRestaurant.id },
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const scans = await db.scanEvent.count({
    where: { restaurantId: activeRestaurant.id },
  });

  return NextResponse.json({ categories, scans, restaurants, restaurant: activeRestaurant });
}

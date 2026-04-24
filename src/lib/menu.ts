import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/defaultData";
import type { MenuCategory, Restaurant } from "@/lib/types";

export type MenuData = {
  categories: MenuCategory[];
  scans: number;
  restaurants: Restaurant[];
  restaurant: Restaurant | null;
};

export async function getMenuData(restaurantSlug?: string, restaurantId?: string): Promise<MenuData> {
  if (process.env.NODE_ENV !== "production") {
    await ensureSeedData();
  }

  const restaurants = await db.restaurant.findMany({
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      imageUrl: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const activeRestaurant =
    restaurants.find((r) => r.slug === restaurantSlug) ??
    restaurants.find((r) => r.id === restaurantId) ??
    restaurants[0];

  if (!activeRestaurant) {
    return { categories: [], scans: 0, restaurants, restaurant: null };
  }

  const categories = await db.category.findMany({
    where: { restaurantId: activeRestaurant.id },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      order: true,
      restaurantId: true,
      items: {
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          description: true,
          price: true,
          imageUrl: true,
          available: true,
          categoryId: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  const scans = await db.scanEvent.count({
    where: { restaurantId: activeRestaurant.id },
  });

  return { categories, scans, restaurants, restaurant: activeRestaurant };
}
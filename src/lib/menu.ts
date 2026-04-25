import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/defaultData";
import type { MenuCategory, Restaurant, MenuItem } from "@/lib/types";

export type MenuOverview = {
  categories: MenuCategory[];
  scans: number;
  restaurants: Restaurant[];
  restaurant: Restaurant | null;
};

async function resolveRestaurant(restaurantSlug?: string, restaurantId?: string) {
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
    restaurants.find((restaurant) => restaurant.slug === restaurantSlug) ??
    restaurants.find((restaurant) => restaurant.id === restaurantId) ??
    restaurants[0] ??
    null;

  return { restaurants, activeRestaurant };
}

export async function getMenuOverview(restaurantSlug?: string, restaurantId?: string): Promise<MenuOverview> {
  await ensureSeedData();

  const { restaurants, activeRestaurant } = await resolveRestaurant(restaurantSlug, restaurantId);

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
    },
    orderBy: { order: "asc" },
  });

  const scans = await db.scanEvent.count({
    where: { restaurantId: activeRestaurant.id },
  });

  return { categories, scans, restaurants, restaurant: activeRestaurant };
}

export async function getMenuCategoryItems(
  categoryId: string,
  restaurantSlug?: string,
  restaurantId?: string,
  limit = 20,
  offset = 0
): Promise<MenuItem[]> {
  await ensureSeedData();
  const { activeRestaurant } = await resolveRestaurant(restaurantSlug, restaurantId);

  const where = activeRestaurant
    ? { categoryId, category: { restaurantId: activeRestaurant.id } }
    : { categoryId };

  return db.menuItem.findMany({
    where,
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
    skip: offset,
    take: limit,
  });
}

export type MenuData = MenuOverview;

export async function getMenuData(restaurantSlug?: string, restaurantId?: string): Promise<MenuData> {
  return getMenuOverview(restaurantSlug, restaurantId);
}

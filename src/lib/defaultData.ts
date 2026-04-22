import { db } from "@/lib/db";

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

export async function ensureSeedData() {
  const restaurantsCount = await db.restaurant.count();
  if (restaurantsCount === 0) {
    const restaurants = [
      {
        slug: "royal-garden",
        nameEn: "Royal Garden",
        nameAr: "رويال جاردن",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop",
      },
      {
        slug: "ocean-flame",
        nameEn: "Ocean Flame",
        nameAr: "أوشن فليم",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format&fit=crop",
      },
      {
        slug: "cedar-house",
        nameEn: "Cedar House",
        nameAr: "سيدر هاوس",
        imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80&auto=format&fit=crop",
      },
      {
        slug: "noor-lounge",
        nameEn: "Noor Lounge",
        nameAr: "نور لاونج",
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop",
      },
    ];

    for (const restaurant of restaurants) {
      const created = await db.restaurant.create({ data: restaurant });
      await db.category.createMany({
        data: defaultCategories.map((category) => ({
          ...category,
          slug: `${created.slug}-${category.slug}`,
          restaurantId: created.id,
        })),
      });
    }
    return;
  }

  const categoriesCount = await db.category.count();
  if (categoriesCount === 0) {
    const restaurants = await db.restaurant.findMany({ orderBy: { createdAt: "asc" } });
    for (const restaurant of restaurants) {
      await db.category.createMany({
        data: defaultCategories.map((category) => ({
          ...category,
          slug: `${restaurant.slug}-${category.slug}`,
          restaurantId: restaurant.id,
        })),
      });
    }
  }

  const orphanCategories = await db.category.findMany({ where: { restaurantId: null } });
  if (orphanCategories.length > 0) {
    const firstRestaurant = await db.restaurant.findFirst({ orderBy: { createdAt: "asc" } });
    if (firstRestaurant) {
      for (const category of orphanCategories) {
        await db.category.update({
          where: { id: category.id },
          data: {
            restaurantId: firstRestaurant.id,
          },
        });
      }
    }
  }
}

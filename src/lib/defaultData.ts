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

const defaultMenuItems = [
  // Cold Appetizers
  { nameEn: "Hummus", nameAr: "حمص", description: "Creamy chickpea dip with tahini and olive oil", price: 8.99, categorySlug: "cold-appetizers", imageUrl: "https://images.unsplash.com/photo-1570797181207-87183f0b4bee?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Baba Ganoush", nameAr: "بابا غنوج", description: "Smoky eggplant dip with tahini and herbs", price: 9.99, categorySlug: "cold-appetizers", imageUrl: "https://images.unsplash.com/photo-1541599468348-e96984315621?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Tabouli", nameAr: "تبولة", description: "Fresh parsley salad with tomatoes, onions and bulgur", price: 7.99, categorySlug: "cold-appetizers", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80&auto=format&fit=crop" },

  // Hot Appetizers
  { nameEn: "Falafel", nameAr: "فلافل", description: "Crispy chickpea patties served with tahini sauce", price: 6.99, categorySlug: "hot-appetizers", imageUrl: "https://images.unsplash.com/photo-1572213788988-1c2becb9a3d3?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Sambousek", nameAr: "سمبوسك", description: "Crispy pastries filled with cheese and spinach", price: 8.99, categorySlug: "hot-appetizers", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Kibbeh", nameAr: "كبة", description: "Crispy bulgur shells filled with spiced meat", price: 10.99, categorySlug: "hot-appetizers", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80&auto=format&fit=crop" },

  // Chicken Meals
  { nameEn: "Grilled Chicken Shawarma", nameAr: "شاورما دجاج مشوية", description: "Marinated grilled chicken served with rice and salad", price: 14.99, categorySlug: "chicken-meals", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Chicken Kebab", nameAr: "كباب دجاج", description: "Skewered chicken with vegetables and rice", price: 16.99, categorySlug: "chicken-meals", imageUrl: "https://images.unsplash.com/photo-1551782450-17144efb5723?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Chicken Biryani", nameAr: "برياني دجاج", description: "Aromatic rice dish with tender chicken and spices", price: 15.99, categorySlug: "chicken-meals", imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80&auto=format&fit=crop" },

  // Meat Meals
  { nameEn: "Lamb Kofta", nameAr: "كفتة لحم", description: "Grilled ground lamb skewers with rice and salad", price: 18.99, categorySlug: "meat-meals", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Beef Shawarma", nameAr: "شاورما لحم", description: "Slow-cooked beef shawarma with garlic sauce", price: 17.99, categorySlug: "meat-meals", imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Mixed Grill Platter", nameAr: "طبق مشاوي مشكل", description: "Assortment of grilled meats with rice and vegetables", price: 24.99, categorySlug: "meat-meals", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80&auto=format&fit=crop" },

  // Grills
  { nameEn: "Mixed Grill", nameAr: "مشاوي مشكل", description: "Selection of grilled meats, chicken and kofta", price: 26.99, categorySlug: "grills", imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Lamb Chops", nameAr: "ضلوع الغنم", description: "Grilled lamb chops with herbs and spices", price: 22.99, categorySlug: "grills", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Beef Steak", nameAr: "ستيك لحم", description: "Grilled beef steak with garlic butter", price: 28.99, categorySlug: "grills", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80&auto=format&fit=crop" },

  // Seafood
  { nameEn: "Grilled Salmon", nameAr: "سلمون مشوي", description: "Fresh grilled salmon with lemon herb sauce", price: 21.99, categorySlug: "seafood", imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Shrimp Pasta", nameAr: "باستا جمبري", description: "Pasta with garlic shrimp in white wine sauce", price: 19.99, categorySlug: "seafood", imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Fish Fillet", nameAr: "فيليه سمك", description: "Pan-fried fish fillet with vegetables", price: 18.99, categorySlug: "seafood", imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80&auto=format&fit=crop" },

  // Pasta
  { nameEn: "Spaghetti Carbonara", nameAr: "سباغيتي كربونارا", description: "Classic Italian pasta with bacon and egg sauce", price: 13.99, categorySlug: "pasta", imageUrl: "https://images.unsplash.com/photo-1551892370-c80a18e25c24?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Penne Arrabbiata", nameAr: "بيني أرابياتا", description: "Pasta in spicy tomato sauce with chili peppers", price: 12.99, categorySlug: "pasta", imageUrl: "https://images.unsplash.com/photo-1551892370-c80a18e25c24?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Fettuccine Alfredo", nameAr: "فيتوتشيني ألفريدو", description: "Creamy pasta with parmesan cheese", price: 14.99, categorySlug: "pasta", imageUrl: "https://images.unsplash.com/photo-1551892370-c80a18e25c24?w=400&q=80&auto=format&fit=crop" },

  // Pizza
  { nameEn: "Margherita Pizza", nameAr: "بيتزا مارغريتا", description: "Classic pizza with tomato, mozzarella and basil", price: 11.99, categorySlug: "pizza", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Pepperoni Pizza", nameAr: "بيتزا بيبروني", description: "Pizza topped with pepperoni and cheese", price: 13.99, categorySlug: "pizza", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Vegetarian Pizza", nameAr: "بيتزا خضار", description: "Pizza loaded with fresh vegetables and cheese", price: 12.99, categorySlug: "pizza", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80&auto=format&fit=crop" },

  // Sandwiches
  { nameEn: "Chicken Shawarma Wrap", nameAr: "شاورما دجاج", description: "Marinated chicken in pita bread with garlic sauce", price: 8.99, categorySlug: "sandwiches", imageUrl: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Beef Burger", nameAr: "برغر لحم", description: "Juicy beef patty with lettuce, tomato and cheese", price: 9.99, categorySlug: "sandwiches", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Falafel Wrap", nameAr: "فلافل", description: "Crispy falafel in pita with tahini and vegetables", price: 7.99, categorySlug: "sandwiches", imageUrl: "https://images.unsplash.com/photo-1572213788988-1c2becb9a3d3?w=400&q=80&auto=format&fit=crop" },

  // Desserts
  { nameEn: "Baklava", nameAr: "بقلاوة", description: "Sweet pastry filled with nuts and honey", price: 5.99, categorySlug: "desserts", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Kunafa", nameAr: "كنافة", description: "Sweet cheese pastry soaked in syrup", price: 6.99, categorySlug: "desserts", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Chocolate Cake", nameAr: "كعكة شوكولاتة", description: "Rich chocolate cake with chocolate frosting", price: 7.99, categorySlug: "desserts", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80&auto=format&fit=crop" },

  // Cold Drinks
  { nameEn: "Fresh Orange Juice", nameAr: "عصير برتقال طازج", description: "Freshly squeezed orange juice", price: 4.99, categorySlug: "cold-drinks", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Mint Lemonade", nameAr: "ليمون نعناع", description: "Refreshing lemonade with fresh mint", price: 3.99, categorySlug: "cold-drinks", imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Iced Coffee", nameAr: "قهوة مثلجة", description: "Cold brewed coffee with milk", price: 4.99, categorySlug: "cold-drinks", imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80&auto=format&fit=crop" },

  // Hot Drinks
  { nameEn: "Turkish Coffee", nameAr: "قهوة تركية", description: "Traditional Turkish coffee with cardamom", price: 3.99, categorySlug: "hot-drinks", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Herbal Tea", nameAr: "شاي أعشاب", description: "Assortment of herbal teas", price: 2.99, categorySlug: "hot-drinks", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Hot Chocolate", nameAr: "شوكولاتة ساخنة", description: "Rich hot chocolate with whipped cream", price: 4.99, categorySlug: "hot-drinks", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80&auto=format&fit=crop" },

  // Shisha
  { nameEn: "Apple Shisha", nameAr: "ارجيلة تفاح", description: "Premium apple flavored shisha", price: 15.99, categorySlug: "shisha", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Mint Shisha", nameAr: "ارجيلة نعناع", description: "Refreshing mint flavored shisha", price: 15.99, categorySlug: "shisha", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80&auto=format&fit=crop" },
  { nameEn: "Mixed Fruit Shisha", nameAr: "ارجيلة فواكه مشكلة", description: "Blend of tropical fruit flavors", price: 16.99, categorySlug: "shisha", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80&auto=format&fit=crop" },
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
      const categories = await db.category.createManyAndReturn({
        data: defaultCategories.map((category) => ({
          ...category,
          slug: `${created.slug}-${category.slug}`,
          restaurantId: created.id,
        })),
      });

      // Create menu items for each category
      for (const category of categories) {
        const categoryItems = defaultMenuItems.filter(item => item.categorySlug === category.slug.replace(`${created.slug}-`, ''));
        if (categoryItems.length > 0) {
          await db.menuItem.createMany({
            data: categoryItems.map(item => ({
              ...item,
              categoryId: category.id,
            })),
          });
        }
      }
    }
    return;
  }

  const categoriesCount = await db.category.count();
  if (categoriesCount === 0) {
    const restaurants = await db.restaurant.findMany({ orderBy: { createdAt: "asc" } });
    for (const restaurant of restaurants) {
      const categories = await db.category.createManyAndReturn({
        data: defaultCategories.map((category) => ({
          ...category,
          slug: `${restaurant.slug}-${category.slug}`,
          restaurantId: restaurant.id,
        })),
      });

      // Create menu items for each category
      for (const category of categories) {
        const categoryItems = defaultMenuItems.filter(item => item.categorySlug === category.slug.replace(`${restaurant.slug}-`, ''));
        if (categoryItems.length > 0) {
          await db.menuItem.createMany({
            data: categoryItems.map(item => ({
              ...item,
              categoryId: category.id,
            })),
          });
        }
      }
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

  // Ensure menu items exist
  const menuItemsCount = await db.menuItem.count();
  if (menuItemsCount === 0) {
    const categories = await db.category.findMany({ include: { restaurant: true } });
    for (const category of categories) {
      if (category.restaurant) {
        const categoryItems = defaultMenuItems.filter(item => item.categorySlug === category.slug.replace(`${category.restaurant!.slug}-`, ''));
        if (categoryItems.length > 0) {
          await db.menuItem.createMany({
            data: categoryItems.map(item => ({
              ...item,
              categoryId: category.id,
            })),
          });
        }
      }
    }
  }
}

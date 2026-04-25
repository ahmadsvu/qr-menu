export type Locale = "en" | "ar";

export type Restaurant = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  imageUrl: string | null;
};

export type MenuCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  order: number;
  restaurantId: string | null;
  items?: MenuItem[];
};

export type MenuItem = {
  id: string;
  nameEn: string;
  nameAr: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
  categoryId: string;
};

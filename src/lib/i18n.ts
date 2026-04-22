import { Locale } from "@/lib/types";

export const dictionary = {
  en: {
    title: "Restaurant Menu",
    subtitle: "Fresh flavors, crafted daily",
    searchPlaceholder: "Search menu...",
    category: "Category",
    allCategories: "All categories",
    outOfStock: "Out of stock",
    currency: "AED",
    admin: "Admin Dashboard",
    login: "Login",
    logout: "Logout",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    scans: "Menu scans",
    qrTitle: "QR for this menu",
    chooseRestaurant: "Choose restaurant",
    allRestaurants: "Restaurants",
  },
  ar: {
    title: "قائمة المطعم المميزة",
    subtitle: "نكهات طازجة يوميًا",
    searchPlaceholder: "ابحث داخل المنيو...",
    category: "التصنيف",
    allCategories: "كل التصنيفات",
    outOfStock: "غير متوفر",
    currency: "د.إ",
    admin: "لوحة التحكم",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    scans: "عدد مرات فتح المنيو",
    qrTitle: "رمز QR لهذه القائمة",
    chooseRestaurant: "اختر المطعم",
    allRestaurants: "المطاعم",
  },
} as const;

export function isArabic(locale: Locale) {
  return locale === "ar";
}

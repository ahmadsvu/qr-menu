"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import clsx from "clsx";
import { dictionary, isArabic } from "@/lib/i18n";
import type { Locale, MenuCategory, MenuItem } from "@/lib/types";
import type { MenuData } from "@/lib/menu";

type CategoryItemsState = {
  items: MenuItem[];
  loading: boolean;
  page: number;
  hasMore: boolean;
};

type CategoryItemsMap = Record<string, CategoryItemsState>;

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error(`Empty response body (${response.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response (${response.status})`);
  }
}

interface MenuClientProps {
  initialData: MenuData;
}

export default function MenuClient({ initialData }: MenuClientProps) {
  const [locale, setLocale] = useState<Locale>("en");
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [overview, setOverview] = useState<MenuData>(initialData);
  const [activeRestaurantSlug, setActiveRestaurantSlug] = useState(initialData.restaurant?.slug ?? "");
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [categoryItems, setCategoryItems] = useState<CategoryItemsMap>({});
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const currentRestaurantSlug = activeRestaurantSlug || overview.restaurant?.slug || "";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  useEffect(() => {
    if (!openCategoryId || !currentRestaurantSlug) {
      return;
    }

    const categoryState = categoryItems[openCategoryId];
    if (!categoryState || (!categoryState.items.length && !categoryState.loading)) {
      console.log("Fetching items for category:", openCategoryId, "restaurant:", currentRestaurantSlug);
      void fetchCategoryItems(openCategoryId);
    }
  }, [openCategoryId, currentRestaurantSlug]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return overview.categories
      .filter((category) => selectedCategoryId === "all" || category.id === selectedCategoryId)
      .filter((category) => {
        if (!term) return true;
        const categoryMatch = [category.nameEn, category.nameAr, category.slug]
          .some((value) => value.toLowerCase().includes(term));

        const loadedItems = categoryItems[category.id]?.items ?? [];
        const itemMatch = loadedItems.some((item) =>
          `${item.nameEn} ${item.nameAr} ${item.description ?? ""}`.toLowerCase().includes(term)
        );

        return categoryMatch || itemMatch;
      });
  }, [overview.categories, selectedCategoryId, search, categoryItems]);

  async function fetchCategoryItems(categoryId: string, append = false) {
    setCategoryItems((current) => ({
      ...current,
      [categoryId]: {
        items: append ? current[categoryId]?.items ?? [] : [],
        loading: true,
        page: append ? current[categoryId]?.page ?? 0 : 0,
        hasMore: true,
      },
    }));

    try {
      const offset = append ? categoryItems[categoryId]?.items.length ?? 0 : 0;
      const url = new URL(`/api/menu/categories/${categoryId}/items`, window.location.origin);
      url.searchParams.set('limit', '20');
      url.searchParams.set('offset', offset.toString());
      if (currentRestaurantSlug) {
        url.searchParams.set('restaurant', currentRestaurantSlug);
      }

      const response = await fetch(url.toString(), { cache: "no-store" });

      if (!response.ok) {
        console.error(`Failed to fetch category items: ${response.status} ${response.statusText}`);
        setCategoryItems((current) => ({
          ...current,
          [categoryId]: {
            items: current[categoryId]?.items ?? [],
            loading: false,
            page: current[categoryId]?.page ?? 0,
            hasMore: false,
          },
        }));
        return;
      }

      const result = await parseJsonResponse<{ items: MenuItem[] }>(response);
      setCategoryItems((current) => ({
        ...current,
        [categoryId]: {
          items: append ? [...(current[categoryId]?.items ?? []), ...result.items] : result.items,
          loading: false,
          page: append ? (current[categoryId]?.page ?? 0) + 1 : 1,
          hasMore: result.items.length === 20,
        },
      }));
    } catch (error) {
      console.error("Error fetching category items:", error);
      setCategoryItems((current) => ({
        ...current,
        [categoryId]: {
          items: current[categoryId]?.items ?? [],
          loading: false,
          page: current[categoryId]?.page ?? 0,
          hasMore: false,
        },
      }));
    }
  }

  async function loadOverview(restaurantSlug: string) {
    setRestaurantLoading(true);
    setSelectedCategoryId("all");
    setOpenCategoryId(null);
    setCategoryItems({});

    const response = await fetch(`/api/menu?restaurant=${encodeURIComponent(restaurantSlug)}`, { cache: "no-store" });
    if (!response.ok) {
      setRestaurantLoading(false);
      return;
    }

    const result = await parseJsonResponse<MenuData>(response);
    setOverview(result);
    setActiveRestaurantSlug(restaurantSlug);
    setRestaurantLoading(false);

    const effectiveSlug = restaurantSlug || result.restaurant?.slug || "";
    if (effectiveSlug) {
      window.history.replaceState(null, "", `/?restaurant=${encodeURIComponent(effectiveSlug)}`);
      void fetch("/api/analytics/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: result.restaurant?.id }),
      });
    }
  }

  const t = dictionary[locale];
  const rtl = isArabic(locale);
  const bodyTextClass = rtl ? "font-body-ar" : "font-en";
  const headingClass = rtl ? "font-head-ar" : "font-en font-semibold";

  return (
    <div className={clsx("mx-auto min-h-screen max-w-7xl px-4 py-4 sm:px-6 sm:py-10", bodyTextClass)}>
      <header className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-3xl border bg-card/95 p-4 sm:p-8 shadow-sm">
        {overview.restaurant?.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${overview.restaurant.imageUrl})` }}
          />
        )}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              <h1 className={clsx("mt-1 text-2xl sm:text-4xl lg:text-5xl", headingClass)}>
                {rtl ? overview.restaurant?.nameAr : overview.restaurant?.nameEn} {overview.restaurant ? "-" : ""} {t.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.scans}: {overview.scans}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                className="rounded-full border px-3 py-2 text-sm hover:bg-accent"
                onClick={() => setLocale((value) => (value === "en" ? "ar" : "en"))}
              >
                {locale === "en" ? "AR" : "EN"}
              </button>
              <button
                type="button"
                className="rounded-full border p-2 hover:bg-accent"
                onClick={() => setDark((value) => !value)}
                aria-label={dark ? t.lightMode : t.darkMode}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {selectedCategoryId === "all" ? (
        // Category selection view
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 rounded-2xl sm:rounded-3xl border bg-card/95 p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <select
                value={currentRestaurantSlug}
                onChange={(e) => void loadOverview(e.target.value)}
                className="rounded-xl sm:rounded-2xl border bg-card px-3 py-2 text-sm outline-none"
              >
                <option value="">{t.chooseRestaurant}</option>
                {overview.restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.slug}>
                    {rtl ? restaurant.nameAr : restaurant.nameEn}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border bg-card px-3 py-2">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => {
              const categoryState = categoryItems[category.id] ?? { items: [], loading: false, page: 0, hasMore: true };
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setOpenCategoryId(category.id);
                  }}
                  className="group rounded-2xl sm:rounded-3xl border bg-card p-4 sm:p-6 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                        {rtl ? category.nameAr : category.nameEn}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        {category.slug}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border px-2 py-1 sm:px-3 text-xs sm:text-sm text-muted-foreground">
                        {categoryState.items.length} item{categoryState.items.length === 1 ? "" : "s"}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">Click to view</span>
                      <span className="text-xs text-muted-foreground sm:hidden">Tap to view</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed bg-card/90 p-4 sm:p-6 text-center text-sm text-muted-foreground shadow-sm">
              {search ? "No categories match your search." : "No categories available."}
            </div>
          )}
        </div>
      ) : (
        // Category items view
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId("all");
                setOpenCategoryId(null);
              }}
              className="self-start rounded-full border px-3 py-2 sm:px-4 text-sm hover:bg-accent transition-colors"
            >
              ← Back to Categories
            </button>
            <div className="flex-1 min-w-0">
              <h2 className={clsx("text-xl sm:text-2xl font-semibold", headingClass)}>
                {(() => {
                  const category = overview.categories.find(c => c.id === selectedCategoryId);
                  return category ? (rtl ? category.nameAr : category.nameEn) : "";
                })()}
              </h2>
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const categoryState = categoryItems[selectedCategoryId] ?? { items: [], loading: false, page: 0, hasMore: true };
                  return `${categoryState.items.length} item${categoryState.items.length === 1 ? "" : "s"}`;
                })()}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const categoryState = categoryItems[selectedCategoryId] ?? { items: [], loading: false, page: 0, hasMore: true };
              if (categoryState.loading && categoryState.items.length === 0) {
                return Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-2xl sm:rounded-3xl border p-3 sm:p-4 shadow-sm">
                    <div className="h-32 sm:h-36 rounded-xl sm:rounded-2xl bg-muted" />
                    <div className="mt-3 sm:mt-4 h-3 sm:h-4 w-3/4 rounded-full bg-muted" />
                    <div className="mt-2 h-3 w-1/2 rounded-full bg-muted" />
                  </div>
                ));
              }

              return categoryState.items.map((item) => (
                <article
                  key={item.id}
                  className={clsx(
                    "rounded-2xl sm:rounded-3xl border bg-card p-3 sm:p-4 transition-shadow duration-200 hover:shadow-lg active:scale-[0.98] sm:hover:scale-100",
                    !item.available && "opacity-70"
                  )}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={rtl ? item.nameAr : item.nameEn}
                      className="h-32 sm:h-44 w-full rounded-xl sm:rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-32 sm:h-44 w-full rounded-xl sm:rounded-2xl bg-muted" />
                  )}
                  <div className="mt-3 sm:mt-4 flex items-start justify-between gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-card-foreground">
                        {rtl ? item.nameAr : item.nameEn}
                      </h3>
                      {item.description ? (
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-primary text-sm sm:text-base font-semibold shrink-0">
                      {item.price.toFixed(2)} {t.currency}
                    </p>
                  </div>
                  {!item.available ? (
                    <span className="mt-2 sm:mt-3 inline-flex rounded-full bg-destructive/10 px-2 py-1 sm:px-3 text-xs font-medium text-destructive">
                      {t.outOfStock}
                    </span>
                  ) : null}
                </article>
              ));
            })()}
          </div>

          {(() => {
            const categoryState = categoryItems[selectedCategoryId] ?? { items: [], loading: false, page: 0, hasMore: true };
            return categoryState.hasMore ? (
              <button
                type="button"
                onClick={() => void fetchCategoryItems(selectedCategoryId, true)}
                disabled={categoryState.loading}
                className="mx-auto block rounded-full border bg-card px-4 py-2 sm:px-6 sm:py-3 text-sm font-medium text-card-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50 active:scale-95"
              >
                {categoryState.loading ? "Loading..." : "Load more items"}
              </button>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

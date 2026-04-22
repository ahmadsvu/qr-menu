"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Search, Sun } from "lucide-react";
import clsx from "clsx";
import { dictionary, isArabic } from "@/lib/i18n";
import type { Locale, MenuCategory, Restaurant } from "@/lib/types";

type ApiData = {
  categories: MenuCategory[];
  scans: number;
  restaurants: Restaurant[];
  restaurant: Restaurant | null;
};

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

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("restaurant") ?? "";
  });
  const [data, setData] = useState<ApiData>({ categories: [], scans: 0, restaurants: [], restaurant: null });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  useEffect(() => {
    const qs = selectedRestaurant ? `?restaurant=${encodeURIComponent(selectedRestaurant)}` : "";
    fetch(`/api/menu${qs}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load menu (${res.status})`);
        }
        return parseJsonResponse<ApiData>(res);
      })
      .then((result: ApiData) => {
        setData(result);
        const effective = selectedRestaurant || result.restaurant?.slug || "";
        if (effective) {
          window.history.replaceState(null, "", `/?restaurant=${encodeURIComponent(effective)}`);
          void fetch("/api/analytics/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ restaurantId: result.restaurant?.id }),
          });
        }
      })
      .catch(() => {
        setData({ categories: [], scans: 0, restaurants: [], restaurant: null });
      });
  }, [selectedRestaurant]);

  const t = dictionary[locale];
  const rtl = isArabic(locale);
  const bodyTextClass = rtl ? "font-body-ar" : "font-en";
  const headingClass = rtl ? "font-head-ar" : "font-en font-semibold";
  const priceClass = rtl ? "font-head-ar tracking-wide" : "font-en font-semibold tracking-wide";

  const filteredCategories = useMemo(() => {
    return data.categories
      .filter((category) => selectedCategory === "all" || category.id === selectedCategory)
      .map((category) => {
        const items = category.items.filter((item) => {
          const haystack = `${item.nameEn} ${item.nameAr} ${item.description ?? ""}`.toLowerCase();
          return haystack.includes(search.toLowerCase());
        });
        return { ...category, items };
      })
      .filter((category) => category.items.length > 0 || search.trim().length === 0);
  }, [data.categories, selectedCategory, search]);

  return (
    <div className={clsx("mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10", bodyTextClass)}>
      <header className="premium-card rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted leading-7">{t.subtitle}</p>
            <h1 className={clsx("mt-1 text-3xl sm:text-4xl", headingClass)}>
              {rtl ? data.restaurant?.nameAr : data.restaurant?.nameEn} {data.restaurant ? "-" : ""} {t.title}
            </h1>
            <p className="mt-2 text-xs text-muted leading-6">
              {t.scans}: {data.scans}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setLocale((v) => (v === "en" ? "ar" : "en"))}
            >
              {locale === "en" ? "AR" : "EN"}
            </button>
            <button
              className="rounded-full border p-2 hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setDark((v) => !v)}
              aria-label={dark ? t.lightMode : t.darkMode}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_240px]">
          <select
            className="rounded-xl border bg-transparent px-3 py-2 text-sm outline-none sm:col-span-2"
            value={data.restaurant?.slug ?? selectedRestaurant}
            onChange={(e) => {
              setSelectedCategory("all");
              setSelectedRestaurant(e.target.value);
            }}
          >
            <option value="">{t.chooseRestaurant}</option>
            {data.restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.slug}>
                {rtl ? restaurant.nameAr : restaurant.nameEn}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 rounded-xl border px-3">
            <Search size={16} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent py-2 text-sm outline-none"
              placeholder={t.searchPlaceholder}
            />
          </div>
          <select
            className="rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">{t.allCategories}</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {rtl ? category.nameAr : category.nameEn}
              </option>
            ))}
          </select>
        </div>
      </header>

      {data.restaurants.length > 0 ? (
        <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => {
                setSelectedCategory("all");
                setSelectedRestaurant(restaurant.slug);
              }}
              className={clsx(
                "premium-card overflow-hidden rounded-xl border text-left transition-transform hover:-translate-y-0.5",
                data.restaurant?.id === restaurant.id && "ring-2 ring-accent"
              )}
            >
              {restaurant.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={restaurant.imageUrl} alt={rtl ? restaurant.nameAr : restaurant.nameEn} className="h-24 w-full object-cover" />
              ) : (
                <div className="h-24 w-full bg-black/5 dark:bg-white/10" />
              )}
              <p className={clsx("p-3 text-sm", headingClass)}>{rtl ? restaurant.nameAr : restaurant.nameEn}</p>
            </button>
          ))}
        </section>
      ) : null}

      <main className="mt-6 space-y-6">
        {filteredCategories.map((category) => (
          <section key={category.id} className="premium-card rounded-2xl p-4 sm:p-6">
            <h2 className={clsx("border-b pb-3 text-2xl", headingClass)}>
              {rtl ? category.nameAr : category.nameEn}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {category.items.map((item) => (
                <article
                  key={item.id}
                  className={clsx(
                    "rounded-xl border p-4 transition-transform duration-300 hover:-translate-y-0.5",
                    !item.available && "opacity-60"
                  )}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={rtl ? item.nameAr : item.nameEn} className="h-36 w-full rounded-lg object-cover" />
                  ) : null}
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h3 className={clsx("text-base", headingClass)}>{rtl ? item.nameAr : item.nameEn}</h3>
                    <p className={clsx("text-accent text-base", priceClass)}>
                      {item.price.toFixed(2)} {t.currency}
                    </p>
                  </div>
                  {item.description ? <p className={clsx("mt-2 text-sm text-muted leading-7", bodyTextClass)}>{item.description}</p> : null}
                  {!item.available ? (
                    <span className="mt-2 inline-block rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">
                      {t.outOfStock}
                    </span>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

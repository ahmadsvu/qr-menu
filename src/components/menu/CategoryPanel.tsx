"use client";

import clsx from "clsx";
import type { MenuCategory, MenuItem } from "@/lib/types";
import type { Locale } from "@/lib/types";

interface CategoryPanelProps {
  category: MenuCategory;
  locale: Locale;
  rtl: boolean;
  currency: string;
  outOfStockLabel: string;
  isOpen: boolean;
  loading: boolean;
  items: MenuItem[];
  hasMore: boolean;
  onToggle: () => void;
  onLoadMore: () => void;
}

export function CategoryPanel({
  category,
  locale,
  rtl,
  currency,
  outOfStockLabel,
  isOpen,
  loading,
  items,
  hasMore,
  onToggle,
  onLoadMore,
}: CategoryPanelProps) {
  return (
    <section className="rounded-3xl border bg-card/95 p-4 shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <p className="text-lg font-semibold text-card-foreground">
            {rtl ? category.nameAr : category.nameEn}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.slug}
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </button>

      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "max-h-[2000px] mt-5" : "max-h-0"
        )}
        style={{ minHeight: isOpen ? undefined : 0 }}
      >
        <div className="space-y-4 pb-4">
          {loading && items.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl border p-4 shadow-sm">
                  <div className="h-36 rounded-2xl bg-muted" />
                  <div className="mt-4 h-4 w-3/4 rounded-full bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className={clsx(
                  "rounded-3xl border bg-card p-4 transition-shadow duration-200 hover:shadow-lg",
                  !item.available && "opacity-70"
                )}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={rtl ? item.nameAr : item.nameEn}
                    className="h-44 w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-44 w-full rounded-2xl bg-muted" />
                )}
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-card-foreground">
                      {rtl ? item.nameAr : item.nameEn}
                    </h3>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-primary text-base font-semibold">
                    {item.price.toFixed(2)} {currency}
                  </p>
                </div>
                {!item.available ? (
                  <span className="mt-3 inline-flex rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    {outOfStockLabel}
                  </span>
                ) : null}
              </article>
            ))
          )}

          {hasMore ? (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more items"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

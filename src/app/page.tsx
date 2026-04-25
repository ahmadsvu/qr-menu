import { Suspense } from "react";
import MenuClient from "./MenuClient";
import { getMenuOverview } from "@/lib/menu";

export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const restaurantSlug = typeof params.restaurant === "string" ? params.restaurant : undefined;
  const restaurantId = typeof params.restaurantId === "string" ? params.restaurantId : undefined;

  const overview = await getMenuOverview(restaurantSlug, restaurantId);

  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuClient initialData={overview} />
    </Suspense>
  );
}

function MenuSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden rounded-3xl border bg-white/80 p-6 shadow-sm lg:block">
          <div className="space-y-4">
            <div className="h-10 rounded-2xl bg-gray-200 animate-pulse" />
            <div className="h-10 rounded-2xl bg-gray-200 animate-pulse" />
            <div className="h-10 rounded-2xl bg-gray-200 animate-pulse" />
          </div>
        </aside>
        <main className="space-y-6">
          <header className="rounded-3xl border bg-white/80 p-6 shadow-sm">
            <div className="h-8 rounded-xl bg-gray-200 animate-pulse" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="h-10 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="h-10 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="h-10 rounded-2xl bg-gray-200 animate-pulse" />
            </div>
          </header>
          {Array.from({ length: 2 }).map((_, index) => (
            <section key={index} className="rounded-3xl border bg-white/80 p-6 shadow-sm">
              <div className="h-8 w-1/3 rounded-xl bg-gray-200 animate-pulse" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="space-y-3 rounded-3xl border p-4">
                    <div className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
                    <div className="h-4 rounded-xl bg-gray-200 animate-pulse" />
                    <div className="h-3 w-3/4 rounded-xl bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

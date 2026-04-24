import { Suspense } from "react";
import MenuClient from "./MenuClient";
import { getMenuData } from "@/lib/menu";

export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Home({ searchParams }: PageProps) {
  const restaurantSlug = typeof searchParams.restaurant === 'string' ? searchParams.restaurant : undefined;
  const restaurantId = typeof searchParams.restaurantId === 'string' ? searchParams.restaurantId : undefined;

  const data = await getMenuData(restaurantSlug, restaurantId);

  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuClient initialData={data} />
    </Suspense>
  );
}

function MenuSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="premium-card rounded-2xl p-4 sm:p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
        <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        </div>
      </header>
      <main className="mt-6 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <section key={i} className="premium-card rounded-2xl p-4 sm:p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <article key={j} className="rounded-xl border p-4">
                  <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
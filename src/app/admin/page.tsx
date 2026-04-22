"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { MenuCategory, Restaurant } from "@/lib/types";

type MenuItemForm = {
  id?: string;
  nameEn: string;
  nameAr: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  available: boolean;
};

const emptyItem: MenuItemForm = {
  nameEn: "",
  nameAr: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
  available: true,
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

type MenuApiResponse = {
  categories: MenuCategory[];
  restaurants: Restaurant[];
  restaurant?: { id: string } | null;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [login, setLogin] = useState({ username: "admin", password: "admin123" });
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [itemForm, setItemForm] = useState<MenuItemForm>(emptyItem);
  const [categoryForm, setCategoryForm] = useState({ id: "", nameEn: "", nameAr: "" });
  const [restaurantForm, setRestaurantForm] = useState({ id: "", nameEn: "", nameAr: "", imageUrl: "" });
  const [qrDataUrl, setQrDataUrl] = useState("");

  const allItems = useMemo(
    () => categories.flatMap((category) => category.items.map((item) => ({ ...item, categoryName: category.nameEn }))),
    [categories]
  );

  const refresh = useCallback(async () => {
    const qs = selectedRestaurantId ? `?restaurantId=${encodeURIComponent(selectedRestaurantId)}` : "";
    const response = await fetch(`/api/menu${qs}`);
    if (!response.ok) {
      throw new Error(`Failed to load menu (${response.status})`);
    }
    const result = await parseJsonResponse<MenuApiResponse>(response);
    setCategories(result.categories);
    setRestaurants(result.restaurants);
    if (!selectedRestaurantId && result.restaurant?.id) {
      setSelectedRestaurantId(result.restaurant.id);
    }
    if (!itemForm.categoryId && result.categories[0]) {
      setItemForm((prev) => ({ ...prev, categoryId: result.categories[0].id }));
    }
  }, [itemForm.categoryId, selectedRestaurantId]);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => parseJsonResponse<{ authenticated: boolean }>(res))
      .then((data) => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) void refresh();
      })
      .catch(() => {
        setAuthenticated(false);
      });
  }, [refresh]);

  useEffect(() => {
    const selected = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId);
    if (!selected) return;
    const url = `${window.location.origin}/?restaurant=${encodeURIComponent(selected.slug)}`;
    QRCode.toDataURL(url).then(setQrDataUrl);
  }, [restaurants, selectedRestaurantId]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    if (res.ok) {
      setAuthenticated(true);
      await refresh();
    } else {
      alert("Invalid admin credentials");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...itemForm,
      price: Number(itemForm.price),
    };
    const url = itemForm.id ? `/api/admin/items/${itemForm.id}` : "/api/admin/items";
    const method = itemForm.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return alert("Unable to save item");
    setItemForm((prev) => ({ ...emptyItem, categoryId: prev.categoryId }));
    await refresh();
  }

  function onImageFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setItemForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  }

  function onRestaurantImageFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setRestaurantForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function removeItem(id: string) {
    if (!confirm("Delete this menu item?")) return;
    const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    await refresh();
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRestaurantId) return alert("Choose restaurant first");
    const payload = { nameEn: categoryForm.nameEn, nameAr: categoryForm.nameAr, restaurantId: selectedRestaurantId };
    const method = categoryForm.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm.id ? { ...payload, id: categoryForm.id } : payload),
    });
    if (!res.ok) return alert("Unable to save category");
    setCategoryForm({ id: "", nameEn: "", nameAr: "" });
    await refresh();
  }

  async function saveRestaurant(e: React.FormEvent) {
    e.preventDefault();
    const payload = { nameEn: restaurantForm.nameEn, nameAr: restaurantForm.nameAr, imageUrl: restaurantForm.imageUrl };
    const method = restaurantForm.id ? "PUT" : "POST";
    const body = restaurantForm.id ? { ...payload, id: restaurantForm.id } : payload;
    const res = await fetch("/api/admin/restaurants", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return alert("Unable to save restaurant");
    setRestaurantForm({ id: "", nameEn: "", nameAr: "", imageUrl: "" });
    await refresh();
  }

  async function removeRestaurant(id: string) {
    if (!confirm("Delete this restaurant and all its data?")) return;
    const res = await fetch("/api/admin/restaurants", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return alert("Cannot delete restaurant");
    if (id === selectedRestaurantId) setSelectedRestaurantId("");
    await refresh();
  }

  async function removeCategory(id: string) {
    if (!confirm("Delete this category and its items?")) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return alert("Cannot delete category with linked items");
    await refresh();
  }

  if (!authenticated) {
    return (
      <div className="font-body-ar mx-auto flex min-h-screen max-w-md items-center px-4">
        <form onSubmit={handleLogin} className="premium-card w-full space-y-4 rounded-2xl p-5">
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            value={login.username}
            onChange={(e) => setLogin((v) => ({ ...v, username: e.target.value }))}
            placeholder="Username"
          />
          <input
            type="password"
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            value={login.password}
            onChange={(e) => setLogin((v) => ({ ...v, password: e.target.value }))}
            placeholder="Password"
          />
          <button className="w-full rounded-lg bg-black px-3 py-2 text-white dark:bg-white dark:text-black">Login</button>
          <p className="text-xs text-muted">Default: admin / admin123 (change in .env)</p>
        </form>
      </div>
    );
  }

  return (
    <div className="font-body-ar mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <select
            className="rounded-lg border px-3 py-2"
            value={selectedRestaurantId}
            onChange={(e) => {
              setSelectedRestaurantId(e.target.value);
              setItemForm({ ...emptyItem, categoryId: "" });
            }}
          >
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.nameEn}
              </option>
            ))}
          </select>
          <button className="rounded-lg border px-3 py-2" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="premium-card rounded-2xl p-4 lg:col-span-3">
          <h2 className="mb-3 font-semibold">Restaurants</h2>
          <form onSubmit={saveRestaurant} className="grid gap-2 sm:grid-cols-4">
            <input className="rounded-lg border px-3 py-2" placeholder="Restaurant EN" value={restaurantForm.nameEn} onChange={(e) => setRestaurantForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <input className="rounded-lg border px-3 py-2" placeholder="Restaurant AR" value={restaurantForm.nameAr} onChange={(e) => setRestaurantForm((v) => ({ ...v, nameAr: e.target.value }))} />
            <input className="rounded-lg border px-3 py-2 sm:col-span-2" type="file" accept="image/*" onChange={(e) => onRestaurantImageFileChange(e.target.files?.[0] ?? null)} />
            <button className="rounded-lg bg-black px-3 py-2 text-white dark:bg-white dark:text-black">{restaurantForm.id ? "Update Restaurant" : "Add Restaurant"}</button>
            <button type="button" className="rounded-lg border px-3 py-2" onClick={() => setRestaurantForm({ id: "", nameEn: "", nameAr: "", imageUrl: "" })}>
              Clear
            </button>
          </form>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="rounded-lg border p-2">
                {restaurant.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={restaurant.imageUrl} alt={restaurant.nameEn} className="h-24 w-full rounded object-cover" />
                ) : (
                  <div className="h-24 w-full rounded bg-black/5 dark:bg-white/10" />
                )}
                <p className="mt-2 text-sm font-medium">{restaurant.nameEn}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <button onClick={() => setRestaurantForm({ id: restaurant.id, nameEn: restaurant.nameEn, nameAr: restaurant.nameAr, imageUrl: restaurant.imageUrl ?? "" })}>Edit</button>
                  <button className="text-rose-600" onClick={() => removeRestaurant(restaurant.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-card rounded-2xl p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Add / Edit Menu Item</h2>
          <form onSubmit={saveItem} className="grid gap-2 sm:grid-cols-2">
            <input className="rounded-lg border px-3 py-2" placeholder="Name EN" value={itemForm.nameEn} onChange={(e) => setItemForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <input className="rounded-lg border px-3 py-2" placeholder="Name AR" value={itemForm.nameAr} onChange={(e) => setItemForm((v) => ({ ...v, nameAr: e.target.value }))} />
            <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="Description" value={itemForm.description} onChange={(e) => setItemForm((v) => ({ ...v, description: e.target.value }))} />
            <input className="rounded-lg border px-3 py-2" type="number" step="0.01" placeholder="Price" value={itemForm.price} onChange={(e) => setItemForm((v) => ({ ...v, price: e.target.value }))} />
            <select className="rounded-lg border px-3 py-2" value={itemForm.categoryId} onChange={(e) => setItemForm((v) => ({ ...v, categoryId: e.target.value }))}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameEn}
                </option>
              ))}
            </select>
            <input className="rounded-lg border px-3 py-2 sm:col-span-2" placeholder="Image URL (optional)" value={itemForm.imageUrl} onChange={(e) => setItemForm((v) => ({ ...v, imageUrl: e.target.value }))} />
            <input className="rounded-lg border px-3 py-2 sm:col-span-2" type="file" accept="image/*" onChange={(e) => onImageFileChange(e.target.files?.[0] ?? null)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={itemForm.available} onChange={(e) => setItemForm((v) => ({ ...v, available: e.target.checked }))} />
              Available
            </label>
            <div className="flex gap-2">
              <button className="rounded-lg bg-black px-3 py-2 text-white dark:bg-white dark:text-black">{itemForm.id ? "Update" : "Create"}</button>
              <button type="button" className="rounded-lg border px-3 py-2" onClick={() => setItemForm({ ...emptyItem, categoryId: categories[0]?.id ?? "" })}>
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="premium-card rounded-2xl p-4">
          <h2 className="mb-3 font-semibold">QR Code</h2>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR code" className="w-full rounded-lg border bg-white p-3" />
          ) : null}
          <p className="mt-2 text-xs text-muted">Each restaurant has its own QR link.</p>
        </section>

        <section className="premium-card rounded-2xl p-4">
          <h2 className="mb-3 font-semibold">Categories</h2>
          <form onSubmit={saveCategory} className="space-y-2">
            <input className="w-full rounded-lg border px-3 py-2" placeholder="Category EN" value={categoryForm.nameEn} onChange={(e) => setCategoryForm((v) => ({ ...v, nameEn: e.target.value }))} />
            <input className="w-full rounded-lg border px-3 py-2" placeholder="Category AR" value={categoryForm.nameAr} onChange={(e) => setCategoryForm((v) => ({ ...v, nameAr: e.target.value }))} />
            <div className="flex gap-2">
              <button className="rounded-lg bg-black px-3 py-2 text-white dark:bg-white dark:text-black">{categoryForm.id ? "Update" : "Add"}</button>
              <button type="button" className="rounded-lg border px-3 py-2" onClick={() => setCategoryForm({ id: "", nameEn: "", nameAr: "" })}>
                Clear
              </button>
            </div>
          </form>
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span>{category.nameEn}</span>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setCategoryForm({ id: category.id, nameEn: category.nameEn, nameAr: category.nameAr })}>Edit</button>
                  <button className="text-rose-600" onClick={() => removeCategory(category.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="premium-card rounded-2xl p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Menu Items</h2>
          <div className="space-y-2">
            {allItems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
                <p>
                  {item.nameEn} - {item.price.toFixed(2)}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setItemForm({
                        id: item.id,
                        nameEn: item.nameEn,
                        nameAr: item.nameAr,
                        description: item.description ?? "",
                        price: String(item.price),
                        categoryId: item.categoryId,
                        imageUrl: item.imageUrl ?? "",
                        available: item.available,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button className="text-rose-600" onClick={() => removeItem(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

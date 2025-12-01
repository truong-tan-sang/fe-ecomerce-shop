import type { CartDto, CartItemDto } from "@/dto/cart";

const STORAGE_KEY = "fe-cart";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getCart(): CartDto {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartDto) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartDto): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(item: Omit<CartItemDto, "id" | "selected"> & { selected?: boolean }): CartDto {
  const cart = getCart();
  // Use variantId as stable identifier; if exists, increase qty
  const existingIndex = cart.findIndex((i) => i.variantId === item.variantId);
  if (existingIndex >= 0) {
    const updated = [...cart];
    updated[existingIndex] = {
      ...updated[existingIndex],
      qty: Math.min(99, updated[existingIndex].qty + item.qty),
    };
    saveCart(updated);
    return updated;
  }

  const newItem: CartItemDto = {
    id: String(item.variantId),
    selected: item.selected ?? true,
    ...item,
  };
  const next = [newItem, ...cart];
  saveCart(next);
  return next;
}

export function updateQty(variantId: number, qty: number): CartDto {
  const cart = getCart();
  const next = cart.map((i) => (i.variantId === variantId ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i));
  saveCart(next);
  return next;
}

export function removeItem(variantId: number): CartDto {
  const next = getCart().filter((i) => i.variantId !== variantId);
  saveCart(next);
  return next;
}

export function toggleSelectAll(selected: boolean): CartDto {
  const next = getCart().map((i) => ({ ...i, selected }));
  saveCart(next);
  return next;
}

export function toggleSelect(variantId: number, selected: boolean): CartDto {
  const next = getCart().map((i) => (i.variantId === variantId ? { ...i, selected } : i));
  saveCart(next);
  return next;
}

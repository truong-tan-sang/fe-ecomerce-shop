"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { cartService } from "@/services/cart";

interface CartContextValue {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const accessToken = session?.user?.access_token ?? null;
  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  const [cartCount, setCartCount] = useState(0);
  const loadedRef = useRef(false);

  const refreshCart = useCallback(async () => {
    if (!accessToken || !userId) {
      setCartCount(0);
      return;
    }
    try {
      console.log("[CartContext] Fetching cart details for user:", userId);
      const res = await cartService.getCartDetails(userId, accessToken);
      const items = res.data?.cartItems ?? [];
      const total = items.reduce((sum, item) => sum + item.quantity, 0);
      console.log("[CartContext] Cart count:", total);
      setCartCount(total);
    } catch (err) {
      console.error("[CartContext] Failed to fetch cart:", err);
    }
  }, [accessToken, userId]);

  useEffect(() => {
    if (!accessToken || !userId) {
      setCartCount(0);
      loadedRef.current = false;
      return;
    }
    if (loadedRef.current) return;
    loadedRef.current = true;
    refreshCart();
  }, [accessToken, userId, refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

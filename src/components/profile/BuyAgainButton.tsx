"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { productVariantService } from "@/services/product-variant";
import { cartService } from "@/services/cart";
import { toast } from "sonner";
import type { OrderItemDto } from "@/dto/order";

interface BuyAgainButtonProps {
  orderItems: Pick<OrderItemDto, "productVariantId">[];
  className?: string;
}

export default function BuyAgainButton({ orderItems, className }: BuyAgainButtonProps) {
  const [outOfStock, setOutOfStock] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adding, setAdding] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!orderItems.length) { setChecking(false); return; }

    Promise.all(
      orderItems.map((item) =>
        productVariantService.getProductVariantById(item.productVariantId)
          .then((res) => res.data?.stock ?? 0)
          .catch(() => 0)
      )
    ).then((stocks) => {
      setOutOfStock(stocks.some((s) => s === 0));
    }).finally(() => setChecking(false));
  }, [orderItems]);

  const handleBuyAgain = async () => {
    if (!session?.user?.access_token || !session?.user?.id) return;
    const token = session.user.access_token;
    const userId = parseInt(session.user.id, 10);

    setAdding(true);
    try {
      const cartRes = await cartService.getCartById(userId, token);
      const cartId = cartRes.data?.id;
      if (!cartId) throw new Error("Không tìm thấy giỏ hàng");

      await Promise.all(
        orderItems.map((item) =>
          cartService.createCartItem(userId, {
            cartId,
            productVariantId: item.productVariantId,
            quantity: 1,
          }, token)
        )
      );

      toast.success("Đã thêm vào giỏ hàng");
      router.push("/cart");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setAdding(false);
    }
  };

  if (checking) {
    return (
      <Button variant="outline" disabled className={`px-4 py-2 h-auto border-gray-300 text-sm cursor-not-allowed ${className ?? ""}`}>
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
        Mua lại
      </Button>
    );
  }

  if (outOfStock) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="outline"
                disabled
                className={`px-4 py-2 h-auto border-gray-300 text-sm cursor-not-allowed opacity-50 ${className ?? ""}`}
              >
                Mua lại
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sản phẩm đã hết hàng</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      disabled={adding}
      onClick={handleBuyAgain}
      className={`px-4 py-2 h-auto border-gray-300 text-sm cursor-pointer ${className ?? ""}`}
    >
      {adding ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Đang thêm...</> : "Mua lại"}
    </Button>
  );
}

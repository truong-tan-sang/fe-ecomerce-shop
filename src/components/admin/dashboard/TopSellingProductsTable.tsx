"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { analyticsService } from "@/services/analytics";
import type { AnalyticsTopSellingVariantDto } from "@/dto/analytics";

interface TopSellingProductsTableProps {
  token: string;
}

const PER_PAGE = 5;

export default function TopSellingProductsTable({ token }: TopSellingProductsTableProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AnalyticsTopSellingVariantDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = async (p: number) => {
    setIsLoading(true);
    try {
      const res = await analyticsService.getTopSellingVariants(token, p, PER_PAGE);
      setData(res.data ?? []);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const thumbnail = (item: AnalyticsTopSellingVariantDto) =>
    item.media.find((m) => m.type === "IMAGE")?.url ?? null;

  return (
    <Card className="bg-white rounded-lg shadow-[var(--admin-card-shadow)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Biến thể bán chạy nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500">
                  <th className="text-left pb-2 font-medium">Biến thể</th>
                  <th className="text-right pb-2 font-medium">Giá</th>
                  <th className="text-right pb-2 font-medium">Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 shrink-0 rounded overflow-hidden bg-gray-100">
                          {thumbnail(item) ? (
                            <Image
                              src={thumbnail(item)!}
                              alt={item.variantName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 m-auto text-gray-300 mt-2" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-xs leading-tight line-clamp-1">
                            {item.variantName}
                          </div>
                          <div className="flex gap-1 mt-0.5">
                            {item.variantColor && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {item.variantColor}
                              </Badge>
                            )}
                            {item.variantSize && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {item.variantSize}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-right text-xs text-gray-700 whitespace-nowrap">
                      {new Intl.NumberFormat("vi-VN").format(item.price)} ₫
                    </td>
                    <td className="py-2 text-right text-xs">
                      <Badge
                        variant={item.stock > 0 ? "default" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {item.stock}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">Trang {page}</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => fetchPage(page - 1)}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => fetchPage(page + 1)}
                  disabled={data.length < PER_PAGE || isLoading}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

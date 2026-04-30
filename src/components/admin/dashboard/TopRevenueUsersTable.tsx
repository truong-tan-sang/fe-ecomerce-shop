"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users, UserCog } from "lucide-react";
import { analyticsService } from "@/services/analytics";
import type { AnalyticsTopRevenueUserDto } from "@/dto/analytics";

interface TopRevenueUsersTableProps {
  token: string;
  type: "users" | "staffs";
}

const PER_PAGE = 5;

export default function TopRevenueUsersTable({ token, type }: TopRevenueUsersTableProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AnalyticsTopRevenueUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = async (p: number) => {
    setIsLoading(true);
    try {
      const res =
        type === "users"
          ? await analyticsService.getTopRevenueUsers(token, p, PER_PAGE)
          : await analyticsService.getTopRevenueStaffs(token, p, PER_PAGE);
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
  }, [token, type]);

  const Icon = type === "users" ? Users : UserCog;
  const title = type === "users" ? "Khách hàng chi tiêu cao nhất" : "Nhân viên doanh thu cao nhất";

  return (
    <Card className="bg-white rounded-lg shadow-[var(--admin-card-shadow)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
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
                  <th className="text-left pb-2 font-medium">Tên</th>
                  <th className="text-right pb-2 font-medium">Đơn hàng</th>
                  <th className="text-right pb-2 font-medium">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 text-xs font-medium text-gray-800">{item.userName}</td>
                    <td className="py-2 text-right text-xs text-gray-600">{item.totalOrdersNumber}</td>
                    <td className="py-2 text-right text-xs text-gray-700 whitespace-nowrap">
                      {new Intl.NumberFormat("vi-VN").format(item.totalRevenue)} ₫
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

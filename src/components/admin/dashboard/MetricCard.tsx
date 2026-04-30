import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  percentageChange: number;
  icon: LucideIcon;
  formatter?: (v: number) => string;
  isLoading?: boolean;
}

export default function MetricCard({
  title,
  value,
  percentageChange,
  icon: Icon,
  formatter,
  isLoading,
}: MetricCardProps) {
  const displayValue =
    typeof value === "number" && formatter ? formatter(value) : value;
  const isPositive = percentageChange >= 0;
  const absChange = Math.abs(percentageChange);

  return (
    <Card className="bg-white rounded-lg shadow-[var(--admin-card-shadow)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse bg-gray-100 rounded" />
        ) : (
          <div className="text-2xl font-bold text-gray-900">{displayValue}</div>
        )}
        <div className="flex items-center gap-1 mt-1">
          {isLoading ? (
            <div className="h-5 w-16 animate-pulse bg-gray-100 rounded" />
          ) : (
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className="text-xs px-1.5 py-0"
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {absChange.toFixed(1)}%
            </Badge>
          )}
          <span className="text-xs text-gray-400">so với kỳ trước</span>
        </div>
      </CardContent>
    </Card>
  );
}

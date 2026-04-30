import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StaticMetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
}

export default function StaticMetricCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: StaticMetricCardProps) {
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
          <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
        )}
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerStackedDataPointDto } from "@/dto/analytics";

interface CustomerStackedChartProps {
  data: CustomerStackedDataPointDto[];
  isLoading?: boolean;
}

export default function CustomerStackedChart({ data, isLoading }: CustomerStackedChartProps) {
  return (
    <Card className="bg-white rounded-lg shadow-[var(--admin-card-shadow)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          Khách hàng mới vs Quay lại
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data.length ? (
          <div className="h-64 animate-pulse bg-gray-100 rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip labelStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="newCustomerCount" name="Khách mới" stackId="a" fill="var(--admin-green-dark)" />
              <Bar dataKey="returningCustomerCount" name="Quay lại" stackId="a" fill="var(--admin-green-mid)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RetentionRateSeriesItemDto } from "@/dto/analytics";

interface RetentionRateChartProps {
  data: RetentionRateSeriesItemDto[];
  isLoading?: boolean;
}

export default function RetentionRateChart({ data, isLoading }: RetentionRateChartProps) {
  return (
    <Card className="bg-white rounded-lg shadow-[var(--admin-card-shadow)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          Tỷ lệ giữ chân khách hàng (%)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || !data.length ? (
          <div className="h-64 animate-pulse bg-gray-100 rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Tỷ lệ giữ chân"]}
                labelStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="retentionRate"
                name="Tỷ lệ giữ chân"
                stroke="var(--admin-green-dark)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

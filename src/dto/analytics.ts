export type AnalyticsViewMode = "WEEKLY" | "MONTHLY" | "YEARLY";

export interface DashboardCardQueryParams {
  viewMode?: AnalyticsViewMode;
  referenceDate?: string;
}

// --- Number metric (most dashboard cards) ---
export interface AnalyticsDashboardCardNumberMetricDto {
  currentPeriod: number;
  previousPeriod: number;
  percentageChange: number;
}

// --- Revenue metric ---
export interface AnalyticsRevenueAmountDto {
  totalAmount: number;
}

export interface AnalyticsTotalRevenueDto {
  _sum: AnalyticsRevenueAmountDto;
  _count: { id: number };
  _avg: AnalyticsRevenueAmountDto;
  _min: AnalyticsRevenueAmountDto;
  _max: AnalyticsRevenueAmountDto;
}

export interface AnalyticsDashboardCardRevenueMetricDto {
  currentPeriod: AnalyticsTotalRevenueDto;
  previousPeriod: AnalyticsTotalRevenueDto;
  percentageChange: number;
}

// --- Top revenue user / staff ---
export interface AnalyticsTopRevenueUserDto {
  userName: string;
  totalOrdersNumber: number;
  totalRevenue: number;
}

// --- Top selling product variant ---
export interface AnalyticsVariantMediaDto {
  id: number;
  url: string;
  type: string;
}

export interface AnalyticsTopSellingVariantDto {
  id: number;
  productId: number;
  variantName: string;
  variantColor: string;
  variantSize: string;
  price: number;
  currencyUnit: string;
  stock: number;
  stockKeepingUnit: string;
  media: AnalyticsVariantMediaDto[];
}

// --- Primary dashboard chart ---
export interface RevenueChartDataItemDto {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface CustomerChartDataItemDto {
  date: string;
  totalCustomers: number;
}

export interface SoldProductVariantChartDataItemDto {
  date: string;
  totalSoldProductVariants: number;
}

export interface PrimaryChartDataBlockDto {
  startDate: string;
  endDate: string;
  customer: CustomerChartDataItemDto[];
  soldProductVariant: SoldProductVariantChartDataItemDto[];
  revenue: RevenueChartDataItemDto[];
}

export interface PrimaryReportDataDto {
  totalCustomers: number;
  totalSoldProductVariants: number;
  totalRevenue: AnalyticsTotalRevenueDto;
  chartData: PrimaryChartDataBlockDto;
}

export interface PrimaryDashboardChartDto {
  currentReportData: PrimaryReportDataDto;
  previousReportData: PrimaryReportDataDto;
}

// --- Secondary dashboard chart ---
export interface CustomerStackedDataPointDto {
  date: string;
  newCustomerCount: number;
  returningCustomerCount: number;
  totalCustomers: number;
}

export interface DailyRetentionRatePointDto {
  date: string;
  customerRetentionRate: number;
}

export interface RetentionRateSeriesItemDto {
  period: string;
  retentionRate: number;
}

export interface SecondaryCustomerReportDataDto {
  startDate: string;
  endDate: string;
  customerChartDataForStackedColumnChart: CustomerStackedDataPointDto[];
  dailyReturningRateFromPreviousCustomerCohortChartData: DailyRetentionRatePointDto[];
}

export interface SecondaryDashboardChartDto {
  currentCustomerReportData: SecondaryCustomerReportDataDto;
  previousCustomerReportData: SecondaryCustomerReportDataDto;
  customerRetentionRateTimeSeries: RetentionRateSeriesItemDto[];
}

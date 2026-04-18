export type VietnamBankName =
  | "AGRIBANK"
  | "BIDV"
  | "VIETCOMBANK"
  | "VIETINBANK"
  | "MBBANK"
  | "ACB"
  | "TECHCOMBANK"
  | "VPBANK"
  | "TPBANK"
  | "SACOMBANK"
  | "HDBANK"
  | "VIB"
  | "OCB"
  | "SHB"
  | "SEABANK"
  | "EXIMBANK"
  | "MSB"
  | "NAMABANK"
  | "BACABANK"
  | "PVCOMBANK"
  | "ABBANK"
  | "LIENVIETPOSTBANK"
  | "KIENLONGBANK"
  | "VIETABANK"
  | "SAIGONBANK";

export const VIETNAM_BANK_OPTIONS: { value: VietnamBankName; label: string }[] = [
  { value: "AGRIBANK",        label: "Agribank" },
  { value: "BIDV",            label: "BIDV" },
  { value: "VIETCOMBANK",     label: "Vietcombank" },
  { value: "VIETINBANK",      label: "VietinBank" },
  { value: "MBBANK",          label: "MB Bank" },
  { value: "ACB",             label: "ACB" },
  { value: "TECHCOMBANK",     label: "Techcombank" },
  { value: "VPBANK",          label: "VPBank" },
  { value: "TPBANK",          label: "TPBank" },
  { value: "SACOMBANK",       label: "Sacombank" },
  { value: "HDBANK",          label: "HDBank" },
  { value: "VIB",             label: "VIB" },
  { value: "OCB",             label: "OCB" },
  { value: "SHB",             label: "SHB" },
  { value: "SEABANK",         label: "SeABank" },
  { value: "EXIMBANK",        label: "Eximbank" },
  { value: "MSB",             label: "MSB" },
  { value: "NAMABANK",        label: "Nam A Bank" },
  { value: "BACABANK",        label: "Bắc Á Bank" },
  { value: "PVCOMBANK",       label: "PVcomBank" },
  { value: "ABBANK",          label: "ABBank" },
  { value: "LIENVIETPOSTBANK",label: "LienVietPostBank" },
  { value: "KIENLONGBANK",    label: "Kiên Long Bank" },
  { value: "VIETABANK",       label: "Việt Á Bank" },
  { value: "SAIGONBANK",      label: "Saigonbank" },
];

export interface CreateReturnRequestDto {
  userId: number;
  orderId: number;
  description: string;
  bankName: VietnamBankName;
  bankAccountNumber: string;
  bankAccountName: string;
}

export type ReturnRequestStatus = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";

export interface ReturnRequestEntity {
  id: number;
  orderId: number;
  userId: number;
  status: ReturnRequestStatus;
  description: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  createdAt: string;
  updatedAt: string;
}

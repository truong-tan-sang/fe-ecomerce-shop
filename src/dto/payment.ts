/**
 * VNPay Payment DTOs based on OpenAPI schema
 */

// ── Create Payment URL ──

export interface BuildPaymentUrlDto {
  vnp_Amount: number;
  vnp_OrderInfo: string;
  vnp_TxnRef: string;
  vnp_IpAddr: string;
  vnp_ReturnUrl: string;
  vnp_CreateDate?: number;
  vnp_ExpireDate?: number;
  vnp_CurrCode?: "VND";
  vnp_Locale?: "vn" | "en";
  vnp_OrderType?: string;
  vnp_BankCode?: string;
}

export interface BuildPaymentUrlOptionsDto {
  withHash?: boolean;
  logger?: { type: "all" } | { type: "omit"; fields: string[] } | { type: "pick"; fields: string[] };
}

export interface CreateVNPayPaymentUrlDto {
  data: BuildPaymentUrlDto;
  options?: BuildPaymentUrlOptionsDto;
}

// ── Verify Return URL ──

export interface ReturnQueryFromVNPayDto {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_SecureHashType?: string;
}

export interface VerifyReturnUrlOptionsDto {
  withHash?: boolean;
  logger?: { type: "all" } | { type: "omit"; fields: string[] } | { type: "pick"; fields: string[] };
}

export interface VerifyVNPayReturnUrlDto {
  data: ReturnQueryFromVNPayDto;
  options?: VerifyReturnUrlOptionsDto;
}

// ── Verify Response ──

export interface VNPayVerifyReturnUrlResponseDto {
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_BankCode: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo: string;
  vnp_ResponseCode: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  isVerified: boolean;
  isSuccess: boolean;
  message: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
}

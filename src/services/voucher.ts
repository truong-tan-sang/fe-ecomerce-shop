import { sendRequest } from "@/utils/api";
import type { VoucherDto, CreateVoucherDto, UpdateVoucherDto, SearchVoucherParams } from "@/dto/voucher";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const voucherService = {
  async searchVouchers(params: SearchVoucherParams, page = 1, perPage = 50): Promise<IBackendRes<VoucherDto[]>> {
    const queryParams: Record<string, string | number | boolean> = { page, perPage };
    if (params.code) queryParams.code = params.code;
    if (params.discountType) queryParams.discountType = params.discountType;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;

    const url = `${BACKEND_URL}/vouchers/search`;
    console.log("[VoucherService] Searching vouchers:", queryParams);
    const response = await sendRequest<IBackendRes<VoucherDto[]>>({ url, method: "GET", queryParams });
    console.log("[VoucherService] Search response:", response);
    return response;
  },

  async getAllVouchers(page = 1, perPage = 50): Promise<IBackendRes<VoucherDto[]>> {
    const url = `${BACKEND_URL}/vouchers`;
    console.log("[VoucherService] Fetching vouchers");
    const response = await sendRequest<IBackendRes<VoucherDto[]>>({ url, method: "GET", queryParams: { page, perPage } });
    console.log("[VoucherService] Vouchers response:", response);
    return response;
  },

  async createVoucher(data: CreateVoucherDto, accessToken: string): Promise<IBackendRes<VoucherDto>> {
    const url = `${BACKEND_URL}/vouchers`;
    console.log("[VoucherService] Creating voucher:", data);
    const response = await sendRequest<IBackendRes<VoucherDto>>({
      url,
      method: "POST",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[VoucherService] Create response:", response);
    return response;
  },

  async updateVoucher(id: number, data: UpdateVoucherDto, accessToken: string): Promise<IBackendRes<VoucherDto>> {
    const url = `${BACKEND_URL}/vouchers/${id}`;
    console.log("[VoucherService] Updating voucher:", id, data);
    const response = await sendRequest<IBackendRes<VoucherDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[VoucherService] Update response:", response);
    return response;
  },

  async deleteVoucher(id: number, accessToken: string): Promise<IBackendRes<VoucherDto>> {
    const url = `${BACKEND_URL}/vouchers/${id}`;
    console.log("[VoucherService] Deleting voucher:", id);
    const response = await sendRequest<IBackendRes<VoucherDto>>({
      url,
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[VoucherService] Delete response:", response);
    return response;
  },
};

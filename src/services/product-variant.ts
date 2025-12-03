import { sendRequest } from "@/utils/api";
import type { ProductVariantDto, CreateProductVariantDto, UpdateProductVariantDto } from "@/dto/product-variant";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const productVariantService = {
  async createProductVariant(data: CreateProductVariantDto, accessToken: string): Promise<IBackendRes<ProductVariantDto>> {
    const url = `${BACKEND_URL}/product-variants`;
    console.log("[ProductVariantService] Creating product variant:", data);
    const response = await sendRequest<IBackendRes<ProductVariantDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[ProductVariantService] Create product variant response:", response);
    return response;
  },

  async getAllProductVariants(accessToken?: string): Promise<IBackendRes<ProductVariantDto[]>> {
    const url = `${BACKEND_URL}/product-variants`;
    console.log("[ProductVariantService] Fetching all product variants");
    const response = await sendRequest<IBackendRes<ProductVariantDto[]>>({
      url,
      method: "GET",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    console.log("[ProductVariantService] Product variants response:", response);
    return response;
  },

  async getProductVariantById(id: number, accessToken?: string): Promise<IBackendRes<ProductVariantDto>> {
    const url = `${BACKEND_URL}/product-variants/${id}`;
    console.log("[ProductVariantService] Fetching product variant:", id);
    const response = await sendRequest<IBackendRes<ProductVariantDto>>({
      url,
      method: "GET",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    console.log("[ProductVariantService] Product variant response:", response);
    return response;
  },
};

import { sendRequest, sendRequestFile } from "@/utils/api";
import type { ProductVariantEntity, CreateProductVariantDto, UpdateProductVariantDto } from "@/dto/product-variant";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const productVariantService = {
  async createProductVariant(data: CreateProductVariantDto, file: File, accessToken: string): Promise<IBackendRes<ProductVariantEntity>> {
    const url = `${BACKEND_URL}/product-variants`;
    console.log("[ProductVariantService] Creating product variant:", data);
    
    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', data.productId.toString());
    formData.append('createByUserId', data.createByUserId.toString());
    formData.append('variantName', data.variantName);
    formData.append('variantColor', data.variantColor);
    formData.append('variantSize', data.variantSize);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('stockKeepingUnit', data.stockKeepingUnit);
    if (data.voucherId) {
      formData.append('voucherId', data.voucherId.toString());
    }
    
    console.log("[ProductVariantService] FormData fields:", {
      file: file.name,
      productId: data.productId,
      createByUserId: data.createByUserId,
      variantName: data.variantName,
      variantColor: data.variantColor,
      variantSize: data.variantSize,
      price: data.price,
      stock: data.stock,
      stockKeepingUnit: data.stockKeepingUnit,
      voucherId: data.voucherId,
    });
    
    const response = await sendRequestFile<IBackendRes<ProductVariantEntity>>({
      url,
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[ProductVariantService] Create product variant response:", response);
    return response;
  },

  async getAllProductVariants(accessToken?: string): Promise<IBackendRes<ProductVariantEntity[]>> {
    const url = `${BACKEND_URL}/product-variants`;
    console.log("[ProductVariantService] Fetching all product variants");
    const response = await sendRequest<IBackendRes<ProductVariantEntity[]>>({
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

  async getProductVariantById(id: number, accessToken?: string): Promise<IBackendRes<ProductVariantEntity>> {
    const url = `${BACKEND_URL}/product-variants/${id}`;
    console.log("[ProductVariantService] Fetching product variant:", id);
    const response = await sendRequest<IBackendRes<ProductVariantEntity>>({
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

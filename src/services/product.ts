import { sendRequest } from "@/utils/api";
import type { ProductDto, PaginatedProductsResponse, GetProductsParams, CreateProductDto } from "@/dto/product";
import type { ProductDetailDto, ProductVariantDto, ReviewDto, CreateReviewDto, UpdateReviewDto } from "@/dto/product-detail";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const productService = {
  async createProduct(data: CreateProductDto, accessToken: string): Promise<IBackendRes<ProductDto>> {
    const url = `${BACKEND_URL}/products`;
    console.log("[ProductService] Creating product:", data);
    const response = await sendRequest<IBackendRes<ProductDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[ProductService] Create product response:", response);
    return response;
  },

  async getAllProducts(
    params: GetProductsParams & { accessToken?: string }
  ): Promise<IBackendRes<ProductDto[]>> {
    const { page = 1, perPage = 20, accessToken } = params;
    const url = `${BACKEND_URL}/products`;
    console.log("[ProductService] Fetching all products:", { page, perPage });
    const response = await sendRequest<IBackendRes<ProductDto[]>>({
      url,
      method: "GET",
      queryParams: { page, perPage },
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
    console.log("[ProductService] Products response:", response);
    return response;
  },

  async getProductById(id: string, accessToken?: string): Promise<IBackendRes<ProductDetailDto>> {
    const url = `${BACKEND_URL}/products/${id}`;
    console.log("[ProductService] Fetching product by id:", id);
    const response = await sendRequest<IBackendRes<ProductDetailDto>>({
      url,
      method: "GET",
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
    console.log("[ProductService] Product detail response:", response);
    return response;
  },

  async getProductVariants(productId: string, accessToken?: string): Promise<IBackendRes<ProductVariantDto[]>> {
    const url = `${BACKEND_URL}/products/${productId}/product-variants`;
    console.log("[ProductService] Fetching variants for product:", productId);
    const response = await sendRequest<IBackendRes<ProductVariantDto[]>>({
      url,
      method: "GET",
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
    console.log("[ProductService] Variants response:", response);
    return response;
  },

  async getProductReviews(productId: string, accessToken?: string): Promise<IBackendRes<ReviewDto[]>> {
    const url = `${BACKEND_URL}/products/${productId}/reviews`;
    console.log("[ProductService] Fetching reviews for product:", productId);
    const response = await sendRequest<IBackendRes<ReviewDto[]>>({
      url,
      method: "GET",
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
    console.log("[ProductService] Reviews response:", response);
    return response;
  },

  async createReview(data: CreateReviewDto, accessToken: string): Promise<IBackendRes<ReviewDto>> {
    const url = `${BACKEND_URL}/reviews`;
    console.log("[ProductService] Creating review:", data);
    const response = await sendRequest<IBackendRes<ReviewDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[ProductService] Create review response:", response);
    return response;
  },

  async updateReview(reviewId: number, data: UpdateReviewDto, accessToken: string): Promise<IBackendRes<ReviewDto>> {
    const url = `${BACKEND_URL}/reviews/${reviewId}`;
    console.log("[ProductService] Updating review:", { reviewId, data });
    const response = await sendRequest<IBackendRes<ReviewDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[ProductService] Update review response:", response);
    return response;
  },

  async deleteReview(reviewId: number, accessToken: string): Promise<IBackendRes<void>> {
    const url = `${BACKEND_URL}/reviews/${reviewId}`;
    console.log("[ProductService] Deleting review:", reviewId);
    const response = await sendRequest<IBackendRes<void>>({
      url,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("[ProductService] Delete review response:", response);
    return response;
  },
};

export type ProductServiceType = typeof productService;

import { sendRequest } from "@/utils/api";
import type { ProductDto, PaginatedProductsResponse, GetProductsParams } from "@/dto/product";
import type { ProductDetailDto, ProductVariantDto, ReviewDto, CreateReviewDto, UpdateReviewDto } from "@/dto/product-detail";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const productService = {
  async getAllProducts(
    params: GetProductsParams & { accessToken?: string }
  ): Promise<IBackendRes<ProductDto[]>> {
    const { page = 1, perPage = 20, accessToken } = params;
    const url = `${BACKEND_URL}/products`;
    // TODO: Backend currently returns flat array, not paginated response
    // When backend implements pagination, change return type to IBackendRes<PaginatedProductsResponse>
    return sendRequest<IBackendRes<ProductDto[]>>({
      url,
      method: "GET",
      queryParams: { page, perPage },
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
  },

  async getProductById(id: string, accessToken?: string): Promise<IBackendRes<ProductDetailDto>> {
    const url = `${BACKEND_URL}/products/${id}`;
    return sendRequest<IBackendRes<ProductDetailDto>>({
      url,
      method: "GET",
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
  },

  async getProductVariants(productId: string, accessToken?: string): Promise<IBackendRes<ProductVariantDto[]>> {
    const url = `${BACKEND_URL}/products/${productId}/product-variants`;
    return sendRequest<IBackendRes<ProductVariantDto[]>>({
      url,
      method: "GET",
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
  },

  async getProductReviews(productId: string, accessToken?: string): Promise<IBackendRes<ReviewDto[]>> {
    const url = `${BACKEND_URL}/products/${productId}/reviews`;
    return sendRequest<IBackendRes<ReviewDto[]>>({
      url,
      method: "GET",
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    });
  },

  async createReview(data: CreateReviewDto, accessToken: string): Promise<IBackendRes<ReviewDto>> {
    const url = `${BACKEND_URL}/reviews`;
    return sendRequest<IBackendRes<ReviewDto>>({
      url,
      method: "POST",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async updateReview(reviewId: number, data: UpdateReviewDto, accessToken: string): Promise<IBackendRes<ReviewDto>> {
    const url = `${BACKEND_URL}/reviews/${reviewId}`;
    return sendRequest<IBackendRes<ReviewDto>>({
      url,
      method: "PATCH",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async deleteReview(reviewId: number, accessToken: string): Promise<IBackendRes<void>> {
    const url = `${BACKEND_URL}/reviews/${reviewId}`;
    return sendRequest<IBackendRes<void>>({
      url,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

export type ProductServiceType = typeof productService;

import { sendRequest } from "@/utils/api";
import type { CategoryDto } from "@/dto/category";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const categoryService = {
  async getAllCategories(accessToken?: string): Promise<IBackendRes<CategoryDto[]>> {
    const url = `${BACKEND_URL}/category`;
    console.log("[CategoryService] Fetching all categories");
    const response = await sendRequest<IBackendRes<CategoryDto[]>>({
      url,
      method: "GET",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    console.log("[CategoryService] Categories response:", response);
    return response;
  },

  async getCategoryById(id: number, accessToken?: string): Promise<IBackendRes<CategoryDto>> {
    const url = `${BACKEND_URL}/category/${id}`;
    console.log("[CategoryService] Fetching category:", id);
    const response = await sendRequest<IBackendRes<CategoryDto>>({
      url,
      method: "GET",
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    console.log("[CategoryService] Category response:", response);
    return response;
  },
};

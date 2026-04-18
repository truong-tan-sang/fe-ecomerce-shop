import { sendRequest } from "@/utils/api";
import type { CreateReturnRequestDto, ReturnRequestEntity } from "@/dto/returnRequest";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const returnRequestService = {
  create(data: CreateReturnRequestDto, accessToken: string): Promise<IBackendRes<ReturnRequestEntity>> {
    console.log("[ReturnRequestService] Creating return request:", data);
    return sendRequest<IBackendRes<ReturnRequestEntity>>({
      url: `${BASE_URL}/return-requests`,
      method: "POST",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};

import { sendRequest } from "../utils/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export interface IUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string; // usually read-only in profile edit
  phone?: string;
  password?: string; // not used here; separate change-password flow
  username?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export const userService = {
  async getUser(id: string, accessToken: string) {
    if (!id) throw new Error("Missing user id for fetch");
    const url = `${BACKEND_URL}/user/${id}`;
    return sendRequest<any>({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
  async updateUser(id: string, data: IUpdateUserDto, accessToken: string) {
    if (!id) throw new Error("Missing user id for update");
    const url = `${BACKEND_URL}/user/${id}`;
    return sendRequest<any>({
      url,
      method: "PATCH",
      body: data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

export type UserServiceType = typeof userService;
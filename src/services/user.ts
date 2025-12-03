import { sendRequest } from "@/utils/api";

export interface UserDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE" | "VIP";
}

export interface IUpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  username?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const userService = {
  getAll: (accessToken?: string) =>
    sendRequest<IBackendRes<UserDto[]>>({
      url: `${BASE_URL}/user`,
      method: "GET",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),

  getUser: (id: string, accessToken: string) =>
    sendRequest<IBackendRes<UserDto>>({
      url: `${BASE_URL}/user/${id}`,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  updateUser: (id: string, data: IUpdateUserDto, accessToken: string) =>
    sendRequest<IBackendRes<UserDto>>({
      url: `${BASE_URL}/user/${id}`,
      method: "PATCH",
      body: data,
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};

export type UserServiceType = typeof userService;
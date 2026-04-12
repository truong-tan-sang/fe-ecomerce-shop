import { sendRequest, sendRequestFile } from "@/utils/api";

export type UserRole = "ADMIN" | "OPERATOR" | "USER";

export interface UserDto {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  image?: string;
  role?: UserRole;
  isActive?: boolean;
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
  role?: UserRole;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const userService = {
  getAll: (accessToken?: string) =>
    sendRequest<IBackendRes<UserDto[]>>({
      url: `${BASE_URL}/user`,
      method: "GET",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }),

  getAllUsers: (accessToken: string) =>
    sendRequest<IBackendRes<UserDto[]>>({
      url: `${BASE_URL}/user?page=1&perPage=9999`,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  getUsers: (page: number, perPage: number, accessToken: string) =>
    sendRequest<IBackendRes<UserDto[]>>({
      url: `${BASE_URL}/user?page=${page}&perPage=${perPage}`,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  getUser: (id: string, accessToken: string) =>
    sendRequest<IBackendRes<UserDto>>({
      url: `${BASE_URL}/user/${id}`,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  updateUser: (id: string, data: IUpdateUserDto, accessToken: string) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) formData.append(key, String(value));
    }
    return sendRequestFile<IBackendRes<UserDto>>({
      url: `${BASE_URL}/user/${id}`,
      method: "PATCH",
      body: formData,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};

export type UserServiceType = typeof userService;
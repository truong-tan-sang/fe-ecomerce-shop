"use server";

import { auth, signIn } from "@/auth";
import { revalidateTag } from "next/cache";
import { sendRequest } from "./api";

/**
 * TODO: Backend Authentication Flow
 * This function handles server-side authentication using NextAuth credentials provider
 * 
 * Backend Requirements:
 * - Endpoint: POST /auth/login
 * - Request: { username: string, password: string }
 * - Response codes:
 *   * 201: Success - returns { user: {...}, access_token: string }
 *   * 401: Invalid credentials (wrong email/password)
 *   * 400: Inactive account (needs email verification)
 * 
 * Error handling:
 * - code 1: InvalidEmailPasswordError - wrong credentials
 * - code 2: InactiveAccountError - account not activated via email
 * - code 0: Internal server error
 */
export async function authenticate(username: string, password: string) {
  try {
    const r = await signIn("credentials", {
      username: username,
      password: password,
      redirect: false,
    });
    console.log(">>> check r: ", r);
    return r;
  } catch (error) {
    if ((error as any).name === "InvalidEmailPasswordError") {
      return {
        error: (error as any).type,
        code: 1,
      };
    } else if ((error as any).name === "InactiveAccountError") {
      return {
        error: (error as any).type,
        code: 2,
      };
    } else {
      return {
        error: "Internal server error",
        code: 0,
      };
    }
  }
}

export const handleCreateUserAction = async (data: any) => {
  const session = await auth();
  const res = await sendRequest<IBackendRes<any>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${session?.user?.access_token}`,
    },
    body: { ...data },
  });
  revalidateTag("list-users");
  return res;
};

export const handleUpdateUserAction = async (data: any) => {
  const session = await auth();
  const res = await sendRequest<IBackendRes<any>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session?.user?.access_token}`,
    },
    body: { ...data },
  });
  revalidateTag("list-users");
  return res;
};

export const handleDeleteUserAction = async (id: any) => {
  const session = await auth();
  const res = await sendRequest<IBackendRes<any>>({
    url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${id}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session?.user?.access_token}`,
    },
  });

  revalidateTag("list-users");
  return res;
};

"use server";

import { signIn } from "@/auth";
import {
  InactiveAccountError,
  InvalidEmailPasswordError,
} from "@/utils/errors";

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
    if (error instanceof InvalidEmailPasswordError) {
      return {
        error: InvalidEmailPasswordError.type,
        code: 1,
      };
    } else if (error instanceof InactiveAccountError) {
      return {
        error: InactiveAccountError.type,
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

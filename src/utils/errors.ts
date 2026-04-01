import { AuthError } from "next-auth";

export class CustomAuthError extends AuthError {
  static type: string;

  constructor(message?: string) {
    super();

    (this as Record<string, unknown>).type = message ?? CustomAuthError.type;
  }
}

export class InvalidEmailPasswordError extends AuthError {
  static type = "Email/Password is invalid";
}

export class InactiveAccountError extends AuthError {
  static type = "Account is not activated yet";
}

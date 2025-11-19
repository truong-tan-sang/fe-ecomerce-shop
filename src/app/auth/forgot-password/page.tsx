"use client";
import DummyLogo from "@/components/app-logo";
import Button from "@/components/button";
import Input from "@/components/input";
import { authService } from "@/services/auth";
import "@ant-design/v5-patch-for-react-19";
import notification from "antd/es/notification";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);

    // TODO: Implement backend forgot password API
    // API endpoint: POST /auth/retry-password
    // Request body: { email: string }
    // Response: { email: string } - confirms email sent
    // Backend should:
    //   1. Check if email exists
    //   2. Generate 6-digit OTP code
    //   3. Store code with expiration (e.g., 15 minutes)
    //   4. Send email with code
    const res = await authService.retryPassword({ email: email.trim() });

    setLoading(false);

    if (res?.data) {
      notification.success({
        message: "Email Sent",
        description: "Please check your inbox for the verification code.",
      });
      // Redirect to new change-password page with email (step 2)
      router.push(`/auth/change-password?email=${encodeURIComponent(email)}`);
    } else {
      notification.error({
        message: "Error",
        description: res?.message || "Failed to send reset password email.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-3 w-full max-w-lg rounded-lg border border-green-200 p-6 sm:p-10">
        <DummyLogo />
        <h2 className="mb-12 text-center text-2xl font-semibold text-gray-800">
          Forgot Password?
        </h2>

        <div className="mb-6 text-center text-sm text-gray-600">
          <p>Enter your email address and we'll send you a code to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
            error={error}
            icon={<Mail size={20} />}
          />
          <Button
            text="Send Reset Code"
            loading={loading}
            disabled={loading}
          />
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

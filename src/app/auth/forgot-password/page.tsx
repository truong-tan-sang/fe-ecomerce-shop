"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";

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

    try {
      await authService.retryPassword({ email: email.trim() });
      toast.success("Please check your inbox for the verification code.");
      router.push(`/auth/change-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const { ApiError } = await import("@/utils/api-error");
      const msg = error instanceof ApiError ? error.message : "Failed to send reset password email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-3 w-full max-w-lg border border-gray-200 p-6 sm:p-10">
        <div className="mb-8 flex justify-center">
          <Image
            src="/LOGO.svg"
            alt="Paplé Logo"
            width={150}
            height={60}
            priority
          />
        </div>
        <h2 className="mb-12 text-center text-2xl font-semibold text-gray-800">
          Forgot Password?
        </h2>

        <div className="mb-6 text-center text-sm text-gray-600">
          <p>Enter your email address and we&apos;ll send you a code to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#9D9D9D]" />
              <Input
                id="forgot-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleChange}
                className="border-0 border-b border-[#9D9D9D] bg-transparent pl-10 pr-4 py-2.5 text-[#9D9D9D] placeholder:text-[#9D9D9D] focus-visible:ring-0 focus-visible:border-[#9D9D9D]"
              />
            </div>
            {error && <p className="ml-3 text-sm text-red-600">{error}</p>}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full border border-neutral-800 bg-neutral-800 px-4 py-2 text-white hover:border-gray-700 hover:bg-gray-900 cursor-pointer"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-900 hover:underline cursor-pointer"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

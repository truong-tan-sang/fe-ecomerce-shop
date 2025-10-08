"use client";
import DummyLogo from "@/components/app-logo";
import Button from "@/components/button";
import Input from "@/components/input";
import { Mail } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter a valid email.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-3 w-full max-w-lg rounded-lg border border-green-200 p-6 sm:p-10">
        <DummyLogo />
        <h2 className="mb-12 text-center text-2xl font-semibold text-gray-800">
          Forgot Password?
        </h2>

        {success ? (
          <p className="mb-6 text-center text-green-600">
            Email has been sent. Please check your inbox.
          </p>
        ) : (
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
              text="Reset Password"
              loading={loading}
              disabled={loading}
            />
          </form>
        )}

        <div className="mt-4 text-center">
          <Link
            href="/login"
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

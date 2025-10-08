"use client";
import DummyLogo from "@/components/app-logo";
import Button from "@/components/button";
import Input from "@/components/input";
import { Lock, Mail } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";

function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showLoader, setShowLoader] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    let newErrors = { email: "", password: "" };

    if (!user.email.trim()) {
      newErrors.email = "Please enter  valid email.";
    }

    if (!user.password.trim()) {
      newErrors.password = "Password cannot be empty.";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setShowLoader(true);

    // Mimic API request
    setTimeout(() => {
      setShowLoader(false);
      console.log("Login successful:", user);
      alert("Login successful!");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <DummyLogo />
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-800">
          Login to Flexy UI
        </h2>
        <form onSubmit={handleSubmit} className="">
          <Input
            type="email"
            label="Email"
            name="email"
            placeholder="Please enter your email"
            value={user.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={20} />}
          />
          <div>
            <Input
              type="password"
              label="Password"
              name="password"
              placeholder="Please enter your password"
              value={user.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock size={20} />}
            />
            {/* Forgot Password Link */}
            <div className="mb-4 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <Button text="Sign in" loading={showLoader} disabled={showLoader} />
        </form>
        {/* Sign-up Link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">New here? </span>
          <Link
            href="/signup"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

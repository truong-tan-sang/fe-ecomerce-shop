"use client";
import DummyLogo from "@/components/app-logo";
import Button from "@/components/button";
import Input from "@/components/input";
import { Lock, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

function Signup() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [showLoader, setShowLoader] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    let newErrors = { name: "", email: "", password: "" };

    if (!user.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!user.email.trim()) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!user.password.trim()) {
      newErrors.password = "Password cannot be empty.";
    }

    if (newErrors.name || newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setShowLoader(true);

    // Mimic API request
    setTimeout(() => {
      setShowLoader(false);
      console.log("Signup successful:", user);
      alert("Signup successful!");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <DummyLogo />
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-800">
          Sign up to Flexy UI
        </h2>
        <form onSubmit={handleSubmit} className="">
          <Input
            type="text"
            label="Full Name"
            name="name"
            placeholder="Please enter your full name"
            value={user.name}
            onChange={handleChange}
            error={errors.name}
            icon={<UserRound size={20} />}
          />
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
          <div className="mt-10">
            <Button
              text="Create an account"
              loading={showLoader}
              disabled={showLoader}
            />
          </div>
        </form>
        {/* Login Link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{" "}
          </span>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;

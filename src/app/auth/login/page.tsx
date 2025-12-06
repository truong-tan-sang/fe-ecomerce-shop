"use client";
import Button from "@/components/button";
import Input from "@/components/input";
import { Lock, Mail } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/utils/actions";
import "@ant-design/v5-patch-for-react-19";
import notification from "antd/es/notification";
import ModalReactive from "@/components/auth/modal.reactive";
import Image from "next/image";

function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showLoader, setShowLoader] = useState(false);
  // Removed modal-based change password in favor of dedicated page
  const router = useRouter();
  const { data: session, status } = useSession();

  const redirectAfterLoginByOAuthMethod = useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user) {
      // Role-based redirect: check both role and isAdmin flag
      const isAdmin = session.user.role === "ADMIN" || session.user.isAdmin === true;
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/homepage");
      }
    }
  }, [status, session, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = user.email.trim();
    const password = user.password.trim();
    let newErrors = { email: "", password: "" };

    // Email validation
    const emailRegex = /^(?:[a-zA-Z0-9_'^&amp;+%`{}~!-]+(?:\.[a-zA-Z0-9_'^&amp;+%`{}~!-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z-]*[a-zA-Z]:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]+)\])$/;
    if (!email) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    // Password validation (min 8 chars)
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setShowLoader(true);

    // TODO: Implement backend authentication
    // API endpoint: POST /auth/login
    // Request body: { username: email, password: password }
    // Response codes:
    //   - 201: Success (returns user data + access_token)
    //   - 401: Invalid credentials
    //   - 400: Inactive account (code === 2)
    const res = await authenticate(user.email, user.password);

    if (res?.error) {
      //error
      console.error("Login error:", res?.error);
      
      if (res?.code === 2) {
        setIsModalOpen(true);
        setUserEmail(user.email);
        return;
      }

      console.error("Login failed:", res?.error);
      setShowLoader(false);
    } else {
      // Refresh session to get updated user data with role
      window.location.href = "/";
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Left Side - Image (use plain <img> to avoid Next.js optimizer errors for invalid files) */}
        <div className="hidden h-full w-1/2 bg-black lg:flex lg:items-center lg:justify-center">
          <div className="relative h-full w-full">
            <img src="/AuthImg.png" alt="Authentication" className="object-cover w-full h-full" />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex h-full w-full items-center justify-center bg-white lg:w-1/2">
          <div className="h-full w-full overflow-hidden px-40 py-20">
          <div className="flex min-h-full w-full flex-col items-center justify-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/LOGO.svg"
                alt="Paplé Logo"
                width={150}
                height={60}
                priority
              />
            </div>

            <div className="flex w-full flex-col items-center justify-start">
              {/* Title */}
              <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
                Đăng nhập vào Paplé
              </h2>

              {/* Google Sign In Button */}
              <button
                onClick={() => signIn("google")}
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-none border border-[#000000] bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Đăng nhập với Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-lg font-bold text-gray-500">
                    — HOẶC —
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <Input
                  type="email"
                  // label="Email"
                  name="email"
                  placeholder="Nhập email"
                  value={user.email}
                  onChange={handleChange}
                  error={errors.email}
                // icon={<Mail size={20} />}
                />

                <Input
                  type="password"
                  // label="Mật khẩu"
                  name="password"
                  placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
                  value={user.password}
                  onChange={handleChange}
                  error={errors.password}
                // icon={<Lock size={20} />}
                />

                {/* Login Button */}
                <Button
                  text="Đăng nhập"
                  loading={showLoader}
                  disabled={showLoader}
                />
              </form>

              {/* Sign up Link */}
              <div className="mt-4 w-full text-center">
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="w-full rounded-none border border-[#000000] bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Đăng ký
                </button>
              </div>

              {/* Forgot Password Link */}
              {/* TODO: Option to replace Modal with page navigation:
                <Link href="/auth/forgot-password">QUÊN MẬT KHẨU?</Link>
                This provides better UX with dedicated URL and prevents data loss on refresh */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push("/auth/change-password")}
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  QUÊN MẬT KHẨU?
                </button>
              </div>
              </div>
          </div>
          </div>
        </div>
      </div>

      <ModalReactive
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        userEmail={userEmail}
      />
    </>
  );
}

export default Login;

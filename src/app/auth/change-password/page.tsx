"use client";
import Button from "@/components/button";
import Input from "@/components/input";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
import notification from "antd/es/notification";
import Image from "next/image";
import { sendRequest } from "@/utils/api";

function ChangePassword() {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code and passwords
  const [formData, setFormData] = useState({
    email: "",
    codeActive: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    codeActive: "",
    password: "",
    confirmPassword: "",
  });
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // If navigated with email query (from forgot-password), skip to step 2
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
      setStep(2);
    }
  }, [searchParams]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmitStep1 = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.email.trim()) {
      setErrors({ ...errors, email: "Vui lòng nhập email hợp lệ." });
      return;
    }

    setShowLoader(true);

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/retry-password`,
      method: "POST",
      body: {
        email: formData.email,
      },
    });

    setShowLoader(false);

    if (res?.data) {
      notification.success({
        message: "Thành công",
        description: "Mã xác nhận đã được gửi đến email của bạn.",
      });
      setStep(2);
    } else {
      notification.error({
        message: "Lỗi",
        description: res?.message,
      });
    }
  };

  const handleSubmitStep2 = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let newErrors = {
      email: "",
      codeActive: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.codeActive.trim()) {
      newErrors.codeActive = "Vui lòng nhập mã xác nhận.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu mới.";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (
      newErrors.codeActive ||
      newErrors.password ||
      newErrors.confirmPassword
    ) {
      setErrors(newErrors);
      return;
    }

    setShowLoader(true);

    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/change-password`,
      method: "POST",
      body: {
        codeActive: formData.codeActive,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        email: formData.email,
      },
    });

    setShowLoader(false);

    if (res?.data) {
      notification.success({
        message: "Thành công",
        description: "Mật khẩu đã được thay đổi thành công. Vui lòng đăng nhập lại.",
      });
      router.push("/auth/login");
    } else {
      notification.error({
        message: "Lỗi",
        description: res?.message,
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden h-full w-1/2 bg-black lg:flex lg:items-center lg:justify-center">
        <div className="relative h-full w-full">
          <Image
            src="/AuthImg.png"
            alt="Authentication"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Side - Change Password Form */}
      <div className="flex h-full w-full items-center justify-center bg-white lg:w-1/2">
        <div className="h-full w-full overflow-y-auto px-40 py-20">
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
                {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
              </h2>

              {/* Description */}
              <p className="mb-6 text-center text-sm text-gray-600">
                {step === 1
                  ? "Nhập email của bạn để nhận mã xác nhận"
                  : "Nhập mã xác nhận và mật khẩu mới"}
              </p>

              {/* Step 1: Enter Email */}
              {step === 1 && (
                <form onSubmit={handleSubmitStep1} className="w-full space-y-4">
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                  />

                  <Button
                    text="Gửi mã xác nhận"
                    loading={showLoader}
                    disabled={showLoader}
                  />
                </form>
              )}

              {/* Step 2: Enter Code and Passwords */}
              {step === 2 && (
                <form onSubmit={handleSubmitStep2} className="w-full space-y-4">
                  {/* 2x2 Grid Layout */}
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="codeActive"
                      placeholder="Mã xác nhận"
                      value={formData.codeActive}
                      onChange={handleChange}
                      error={errors.codeActive}
                    />

                    <Input
                      type="password"
                      name="password"
                      placeholder="Mật khẩu mới"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                    />

                    <Input
                      type="text"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                    />

                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                    />
                  </div>

                  <Button
                    text="Đổi mật khẩu"
                    loading={showLoader}
                    disabled={showLoader}
                  />
                </form>
              )}

              {/* Back to Login Link */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;

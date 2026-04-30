"use client";
import React, { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Verify = (props: { id: string }) => {
  const { id } = props;
  const router = useRouter();
  const [codeActive, setCodeActive] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!codeActive.trim()) {
      setError("Vui lòng nhập mã kích hoạt!");
      return;
    }

    try {
      await authService.checkCode({ id, codeActive });
      toast.success("Tài khoản của bạn đã được kích hoạt.");
      router.push(`/auth/login`);
    } catch (error) {
      const { ApiError } = await import("@/utils/api-error");
      const msg = error instanceof ApiError ? error.message : "Xác thực thất bại";
      toast.error(msg);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="w-full max-w-md">
        <fieldset className="p-4 m-1 border border-gray-300">
          <legend className="text-sm font-medium px-1">Kích hoạt tài khoản</legend>
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>Mã kích hoạt đã được gửi đến email của bạn. Vui lòng kiểm tra email.</div>
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="codeActive">Mã kích hoạt</Label>
              <Input
                id="codeActive"
                placeholder="Nhập mã kích hoạt 6 chữ số"
                value={codeActive}
                onChange={(e) => {
                  setCodeActive(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="cursor-pointer">
              Xác nhận
            </Button>
          </form>
          <div className="mt-4">
            <Link href="/" className="inline-flex items-center gap-1 text-sm hover:underline cursor-pointer">
              <ArrowLeft className="size-4" /> Về trang chủ
            </Link>
          </div>
          <Separator className="my-4" />
          <div className="text-center text-sm">
            Đã có tài khoản? <Link href="/auth/login" className="hover:underline cursor-pointer">Đăng nhập</Link>
          </div>
        </fieldset>
      </div>
    </div>
  );
};

export default Verify;

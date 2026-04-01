"use client";

import { useHasMounted } from "@/utils/customHook";
import { FormEvent, useEffect, useState } from "react";
import { authService } from "@/services/auth";
import { toast } from "sonner";
import { User, ShieldCheck, Smile } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ModalReactiveProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  userEmail: string;
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { label: "Login", icon: User },
    { label: "Verification", icon: ShieldCheck },
    { label: "Done", icon: Smile },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === current;
        const isDone = index < current;
        return (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`flex size-8 items-center justify-center border ${
                  isActive || isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span
                className={`mt-1 text-xs ${
                  isActive || isDone ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 ${
                  isDone ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const ModalReactive = (props: ModalReactiveProps) => {
  const { isModalOpen, setIsModalOpen, userEmail } = props;
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const hasMounted = useHasMounted();

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  if (!hasMounted) return <></>;

  const onFinishStep0 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await authService.retryActive({ email });
      setUserId(res?.data?.data?._id || "");
      setCurrent(1);
    } catch (error) {
      const { ApiError } = await import("@/utils/api-error");
      const msg = error instanceof ApiError ? error.message : "Request failed";
      toast.error(msg);
    }
  };

  const onFinishStep1 = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code.trim()) {
      setCodeError("Please input your activation code!");
      return;
    }
    try {
      await authService.checkCode({
        codeActive: code,
        id: userId,
      });
      setCurrent(2);
    } catch (error) {
      const { ApiError } = await import("@/utils/api-error");
      const msg = error instanceof ApiError ? error.message : "Verification failed";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Active Your Account</DialogTitle>
        </DialogHeader>

        <StepIndicator current={current} />

        {current === 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Your account has not been activated</p>
            </div>
            <form onSubmit={onFinishStep0} autoComplete="off" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reactive-email">Email Address</Label>
                <Input
                  id="reactive-email"
                  value={email}
                  disabled
                />
              </div>
              <Button type="submit" className="cursor-pointer">
                Resend
              </Button>
            </form>
          </>
        )}

        {current === 1 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Type code confirm, please!</p>
            </div>
            <form onSubmit={onFinishStep1} autoComplete="off" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reactive-code">Activation Code</Label>
                <Input
                  id="reactive-code"
                  placeholder="Enter 6-digit activation code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeError("");
                  }}
                />
                {codeError && <p className="text-sm text-destructive">{codeError}</p>}
              </div>
              <Button type="submit" className="cursor-pointer">
                Active
              </Button>
            </form>
          </>
        )}

        {current === 2 && (
          <div className="my-4">
            <p className="text-sm">
              Your account has been successfully activated. Please log in again.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalReactive;

"use client";
import DummyLogo from "@/components/app-logo";
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
import ModalChangePassword from "@/components/auth/modal.change.password";

function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showLoader, setShowLoader] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const redirectAfterLoginByOAuthMethod = useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      // Admin redirect to dashboard
      // void router.push("/dashboard");

      // Customer redirect to homepage
      router.push("/homepage");
    }
  }, [status, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    const res = await authenticate(user.email, user.password);

    if (res?.error) {
      //error
      if (res?.code === 2) {
        setIsModalOpen(true);
        setUserEmail(user.email);
        return;
      }

      notification.error({
        message: "Error login",
        description: res?.error,
      });

      setShowLoader(false);
    } else {
      router.push("/homepage");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-lg bg-white p-6">
          <DummyLogo />
          <h2 className="mb-8 text-center text-2xl font-semibold text-gray-800">
            Login to BK Ecommerce shop
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
                <div
                  className="cursor-pointer text-sm text-blue-600 hover:underline"
                  onClick={() => setChangePassword(true)}
                >
                  Forgot Password?
                </div>
              </div>
            </div>
            <Button text="Sign in" loading={showLoader} disabled={showLoader} />
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>

            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-sm text-gray-500">Or</span>
            </div>
          </div>

          {/* Signin with Google Link */}
          <div className="mt-5 mb-4 flex flex-row gap-2 text-right">
            <div
              onClick={() => signIn("google")}
              className="text-justify-center mx-auto flex h-[40px] w-1/2 cursor-pointer items-center justify-center rounded-xl border text-center text-sm text-gray-800 hover:bg-gray-200"
            >
              <i className="fa-brands fa-google mr-2"></i>
              <div>Sign in with Google</div>
            </div>

            <div
              onClick={() => signIn("facebook")}
              className="text-justify-center mx-auto flex h-[40px] w-1/2 cursor-pointer items-center justify-center rounded-xl border text-center text-sm text-gray-800 hover:bg-gray-200"
            >
              <i className="fa-brands fa-facebook mr-2"></i>
              <div>Sign in with Facebook</div>
            </div>
          </div>

          {/* Sign-up Link */}
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">New here? </span>
            <Link
              href="/auth/signup"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <ModalReactive
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        userEmail={userEmail}
      />
      <ModalChangePassword
        isModalOpen={changePassword}
        setIsModalOpen={setChangePassword}
      />
    </>
  );
}

export default Login;

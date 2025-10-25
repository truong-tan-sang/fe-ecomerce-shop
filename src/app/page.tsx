import Image from "next/image";
import Login from "@/app/auth/login/page";
import Signup from "@/app/auth/signup/page";
import ForgotPassword from "./auth/forgot-password/page";

export default function Home() {
  return (
    <>
      <Login />
    </>
  );
}

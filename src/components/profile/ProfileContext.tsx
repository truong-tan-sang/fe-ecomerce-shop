"use client";
import React, { createContext, useContext } from "react";

export type ProfileData = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  image?: string;
  username?: string;
  [key: string]: any;
};

const Ctx = createContext<ProfileData | null>(null);

export function useProfile() {
  return useContext(Ctx);
}

export function ProfileContextProvider({
  value,
  children,
}: {
  value: ProfileData | null;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

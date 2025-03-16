'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { ClientSafeProvider, LiteralUnion } from "next-auth/react";
import type { BuiltInProviderType } from "next-auth/providers";

interface SignInButtonsProps {
  providers: Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider> | null;
}

export default function SignInButtons({ providers }: SignInButtonsProps) {
  return (
    <>
      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.name} className="flex justify-center">
            <Button
              onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              className="w-full max-w-sm"
              variant={provider.id === "google" ? "default" : "outline"}
            >
              使用 {provider.name} 登入
            </Button>
          </div>
        ))}
    </>
  );
} 
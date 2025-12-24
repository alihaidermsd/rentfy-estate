"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SocialAuth() {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("facebook", { callbackUrl: "/" })}
      >
        Continue with Facebook
      </Button>
      <Button variant="outline" className="w-full">
        Continue with Apple
      </Button>
    </div>
  );
}
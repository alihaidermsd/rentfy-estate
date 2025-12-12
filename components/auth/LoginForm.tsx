"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema } from "@/lib/validations";

type LoginFormData = z.infer<typeof loginSchema>;

const getDashboardRedirectPath = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/dashboard/admin";
    case "AGENT":
      return "/dashboard/agent";
    case "OWNER":
      return "/dashboard/owner";
    case "USER":
    default:
      return "/dashboard/user";
  }
};

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    toast.loading("Signing in...");

    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      toast.dismiss();

      if (result?.error) {
        toast.error("Login failed. Please check your credentials.");
        console.error("Login Error:", result.error);
      } else if (result?.ok) {
        // We need to get the user's role to redirect correctly.
        // The session is not immediately available after signIn,
        // so we make a request to the session endpoint.
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();

        const role = session?.user?.role;
        
        if (role) {
          const redirectPath = getDashboardRedirectPath(role);
          toast.success("Login successful! Redirecting...");
          router.push(redirectPath);
          router.refresh(); // Refresh the page to ensure session is fully loaded
        } else {
          // Fallback if role is not found
          toast.success("Login successful!");
          router.push("/");
          router.refresh();
        }
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An unexpected error occurred.");
      console.error("Submit Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const allowSignup =
  process.env.NEXT_PUBLIC_ALLOW_ADMIN_SIGNUP === "true" ||
  process.env.NODE_ENV === "development";

export default function LoginPage() {
  const { login, register: registerAdmin, user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const nextPath = () => {
    if (typeof window === "undefined") return "/dashboard";
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";
  };

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath());
    }
  }, [loading, user, router]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      if (mode === "create") {
        await registerAdmin(values.email, values.password);
        toast.success("Admin account created");
      } else {
        await login(values.email, values.password);
        toast.success("Welcome back");
      }
      router.replace(nextPath());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid email or password";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="surface-grid relative flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <p className="font-display text-4xl font-semibold tracking-tight text-foreground">
            Vivexa
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Employee Management System
          </p>
        </div>

        <Card className="shadow-lift">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle>
              {mode === "create" ? "Create admin account" : "Admin sign in"}
            </CardTitle>
            <CardDescription>
              {mode === "create"
                ? "This creates a Firebase Authentication user. Use a real email and a password of at least 6 characters."
                : "Sign in with a Firebase Authentication user. Employee records cannot be used here."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {formError ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@vivexa.com"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "create" ? "new-password" : "current-password"
                  }
                  placeholder="At least 6 characters"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {mode === "create" ? "Create account" : "Sign in"}
              </Button>
              {allowSignup ? (
                <button
                  type="button"
                  className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  onClick={() => {
                    setFormError(null);
                    setMode((current) =>
                      current === "create" ? "signin" : "create",
                    );
                  }}
                >
                  {mode === "create"
                    ? "Already have an account? Sign in"
                    : "No admin user yet? Create one"}
                </button>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

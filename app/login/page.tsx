"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setIsLoading(false);
      setErrorMessage("Supabase environment variables are not configured.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard/summary");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-shell px-4">
      <div className="w-full max-w-md rounded-3xl bg-card-light p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Home Dashboard</h1>
        <p className="mt-2 text-sm text-text-muted">
          Sign in with your Supabase credentials.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
            aria-label="Email address"
          />

          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
            aria-label="Password"
          />

          {errorMessage ? (
            <p className="text-sm text-accent-red" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-topbar px-4 py-3 text-sm font-semibold text-text-on-dark"
            aria-label="Sign in"
            disabled={isLoading}
          >
            {isLoading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

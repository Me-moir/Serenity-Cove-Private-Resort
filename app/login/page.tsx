"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeSlash, LockFill, PersonFill } from "react-bootstrap-icons";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
const AUTH_COOKIE_NAME = "sc_admin";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setAuthCookie = () => {
    const maxAgeSeconds = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 8;
    let cookieValue = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAgeSeconds}; samesite=lax`;

    if (window.location.protocol === "https:") {
      cookieValue += "; secure";
    }

    document.cookie = cookieValue;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const trimmedUsername = username.trim();
    const isValid =
      trimmedUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD;

    if (!isValid) {
      setIsLoading(false);
      setErrorMessage("Invalid credentials. Use admin / admin.");
      return;
    }

    setAuthCookie();
    router.push("/dashboard/summary");
  };

  const hasError = Boolean(errorMessage);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e6e7eb] px-4 text-[#555556]">
      <div className="w-full max-w-xl text-center">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
          <div className="flex h-20 w-20 items-center justify-center">
            <Image
              src="/icons/sc-logo.png"
              alt="Serenity Cove logo"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-sm uppercase tracking-[0.2em] text-[#8f8f92]">
              Welcome to
            </div>
            <div className="mt-1 text-2xl font-semibold text-[#2b2b2e]">
              SERENITY COVE
            </div>
            <div className="text-lg font-medium tracking-[0.1em] text-[#2b2b2e]">
              ADMIN PORTAL
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm text-[#9a9aa0]">Sign in to your account</p>

        <form className="mx-auto mt-6 max-w-md space-y-5 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a6a6ab]">
              Username
            </label>
            <div
              className={`mt-2 flex h-11 items-center rounded-lg bg-white shadow-sm transition ${
                hasError
                  ? "ring-1 ring-red-400"
                  : "border border-transparent"
              }`}
            >
              <span
                className={`flex h-full w-11 items-center justify-center border-r text-[#b8b8bc] ${
                  hasError ? "border-red-200" : "border-[#e1e1e6]"
                }`}
              >
                <PersonFill size={16} />
              </span>
              <input
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                placeholder="input username here"
                className="h-full flex-1 bg-transparent px-3 text-sm text-[#4a4a4d] placeholder:text-[#c2c2c7] focus:outline-none"
                aria-label="Username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a6a6ab]">
              Password
            </label>
            <div
              className={`mt-2 flex h-11 items-center rounded-lg bg-white shadow-sm transition ${
                hasError
                  ? "ring-1 ring-red-400"
                  : "border border-transparent"
              }`}
            >
              <span
                className={`flex h-full w-11 items-center justify-center border-r text-[#b8b8bc] ${
                  hasError ? "border-red-200" : "border-[#e1e1e6]"
                }`}
              >
                <LockFill size={16} />
              </span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                onKeyDown={(event) => setCapsLockOn(event.getModifierState("CapsLock"))}
                onKeyUp={(event) => setCapsLockOn(event.getModifierState("CapsLock"))}
                onBlur={() => setCapsLockOn(false)}
                placeholder="input password here"
                className="h-full flex-1 bg-transparent px-3 text-sm text-[#4a4a4d] placeholder:text-[#c2c2c7] focus:outline-none"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="h-full px-3 text-[#8f8f92]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {capsLockOn ? (
              <p className="mt-2 text-xs text-[#c06a00]">
                Caps Lock is on.
              </p>
            ) : null}
          </div>

          <label className="flex items-center gap-3 text-xs text-[#a6a6ab]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border border-[#c8c8cc] bg-white text-[#6f6f74]"
            />
            Remember me
          </label>

          {errorMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="rounded-full bg-[#6d6d70] px-10 py-2 text-sm font-semibold tracking-[0.15em] text-white hover:bg-[#5f5f62]"
              aria-label="Login"
              disabled={isLoading}
            >
              {isLoading ? "LOGGING IN" : "LOGIN"}
            </button>
          </div>

          <div className="pt-6 text-center text-xs text-[#a6a6ab]">
            <div className="mx-auto h-px w-4/5 bg-[#c7c7cc]" />
            <p className="mt-4">
              Forgot your password? <span className="underline">Contact Admin</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

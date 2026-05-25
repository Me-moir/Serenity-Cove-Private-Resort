"use client";

import { useState } from "react";
import { CheckCircleFill, Circle } from "react-bootstrap-icons";

interface Requirement {
  label: string;
  isMet: boolean;
}

export default function ProfileSubtab2Page() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const requirements: Requirement[] = [
    { label: "Minimum of 8 characters", isMet: newPassword.length >= 8 },
    {
      label: "Maximum of 16 characters",
      isMet: newPassword.length <= 16 && newPassword.length > 0,
    },
    { label: "Must have a letter", isMet: /[a-zA-Z]/.test(newPassword) },
    { label: "Must have a number", isMet: /\d/.test(newPassword) },
    { label: "Must have at least one symbol", isMet: /[^a-zA-Z0-9]/.test(newPassword) },
  ];

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-light text-text-muted">
        Password and{" "}
        <span className="font-semibold text-text-on-light">Security</span>
      </h1>

      {/* ── Change Password ──────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card-light p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Form */}
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-text-on-light">
              Change Password
            </h2>

            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:border-[#9a9a9a] focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-10 w-full rounded-xl border bg-shell px-3 text-sm text-text-on-light placeholder:text-text-muted/50 focus:outline-none transition ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? "border-accent-green focus:border-accent-green"
                      : "border-accent-red focus:border-accent-red"
                    : "border-border focus:border-[#9a9a9a]"
                }`}
                placeholder="••••••••"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1 text-xs text-accent-red">
                  Passwords do not match.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={
                  !requirements.every((r) => r.isMet) || !passwordsMatch
                }
                className="rounded-xl bg-topbar px-6 py-2.5 text-sm font-semibold text-text-on-dark transition hover:opacity-80 disabled:opacity-40"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Requirements */}
          <div className="md:pt-10">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">
              Password Requirements
            </h3>
            <ul className="space-y-3">
              {requirements.map((req) => (
                <li key={req.label} className="flex items-center gap-3">
                  {req.isMet ? (
                    <CheckCircleFill size={16} className="shrink-0 text-accent-green" />
                  ) : (
                    <Circle size={16} className="shrink-0 text-text-muted/40" />
                  )}
                  <span
                    className={`text-sm transition-colors ${
                      req.isMet ? "font-medium text-accent-green" : "text-text-muted"
                    }`}
                  >
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Active Login Sessions ────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card-light p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-text-on-light">
          Active Login Sessions
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                {["Device", "Location", "Last Active", "Status"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border last:border-0">
                <td className="py-4 text-sm font-medium text-text-on-light">
                  Desktop
                </td>
                <td className="py-4 text-sm text-text-muted">
                  Sampaloc, Manila
                </td>
                <td className="py-4 text-sm text-text-muted">
                  May 25, 2026
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-green/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

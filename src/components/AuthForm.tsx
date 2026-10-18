"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { cn, safeNext } from "@/lib/utils";

type Mode = "login" | "signup";

export function AuthForm({
  initialMode = "login",
  next,
  onAuthenticated,
  confirmationNote,
}: {
  initialMode?: Mode;
  next?: string;
  // When provided, called instead of the default redirect after a successful login/signup.
  onAuthenticated?: (user: User) => Promise<void> | void;
  confirmationNote?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function finish(user: User) {
    if (onAuthenticated) {
      await onAuthenticated(user);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const home = data?.role === "investigator" ? "/admin" : "/dashboard";
    router.replace(safeNext(next) ?? home);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Please use at least 8 characters for your password.");
        const afterConfirm = safeNext(next) ?? "/dashboard";
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(afterConfirm)}`,
          },
        });
        if (error) throw error;
        if (!data.session || !data.user) {
          setInfo(
            confirmationNote ??
              "Check your inbox to confirm your email address. The link will bring you back here.",
          );
          return;
        }
        await finish(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await finish(data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-white/[0.04] p-1 text-sm" role="tablist">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setInfo(null);
            }}
            className={cn(
              "rounded-lg py-2 font-medium transition",
              mode === m ? "bg-ink-700 text-zinc-50 shadow" : "text-zinc-400 hover:text-zinc-200",
            )}
          >
            {m === "signup" ? "Create account" : "Log in"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="label" htmlFor="full_name">
              Full name
            </label>
            <input
              id="full_name"
              className="input"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && <p className="hint">At least 8 characters.</p>}
        </div>

        {error && <p className="alert-error">{error}</p>}
        {info && <p className="alert-info">{info}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}

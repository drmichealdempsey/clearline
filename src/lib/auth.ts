import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

// Cached per request so the header and the page share one auth lookup.
export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { supabase, user, profile: (profile as Profile | null) ?? null };
});

// Server-side guard in addition to the middleware: pages never trust routing alone.
export async function requireRole(role: Role) {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/login");
  const actual: Role = profile?.role ?? "client";
  if (actual !== role) redirect(actual === "investigator" ? "/admin" : "/dashboard");
  return { supabase, user, profile };
}

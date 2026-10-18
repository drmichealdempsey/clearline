import type { Metadata } from "next";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return <AuthPage mode="signup" next={searchParams.next} error={searchParams.error} />;
}

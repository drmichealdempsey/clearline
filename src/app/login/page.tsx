import type { Metadata } from "next";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return <AuthPage mode="login" next={searchParams.next} error={searchParams.error} />;
}

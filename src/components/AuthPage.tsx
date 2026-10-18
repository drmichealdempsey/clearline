import { AuthForm } from "@/components/AuthForm";

export function AuthPage({
  mode,
  next,
  error,
}: {
  mode: "login" | "signup";
  next?: string;
  error?: string;
}) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <h1 className="text-center font-display text-3xl tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {mode === "login"
            ? "Log in to view your cases and updates."
            : "Your account gives you a private portal to follow your case."}
        </p>
        <div className="card mt-8 p-5 sm:p-7">
          {error && (
            <p className="alert-error mb-5">
              {error === "confirmation"
                ? "That confirmation link is invalid or has expired. Please log in or sign up again."
                : "Something went wrong. Please try again."}
            </p>
          )}
          <AuthForm initialMode={mode} next={next} />
        </div>
      </div>
    </div>
  );
}

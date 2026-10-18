import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { LogoMark } from "@/components/icons";

export async function SiteHeader() {
  const { user, profile } = await getCurrentUser();
  const isInvestigator = profile?.role === "investigator";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 text-brass-300">
          <LogoMark />
          <span className="font-display text-lg tracking-tight text-zinc-50">
            <span className="sm:hidden">{siteConfig.shortName}</span>
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <Link href={isInvestigator ? "/admin" : "/dashboard"} className="btn-ghost btn-sm">
                {isInvestigator ? "Case console" : "My cases"}
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn-secondary btn-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/start" className="btn-primary btn-sm">
                Start a case
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

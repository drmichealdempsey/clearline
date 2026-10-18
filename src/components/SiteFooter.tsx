import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-950">
      <div className="container-page grid gap-8 py-10 text-sm sm:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-base text-zinc-100">{siteConfig.name}</p>
          <p className="mt-2 max-w-md text-zinc-500">
            Investigations are carried out using lawful methods only. Every case is different and we
            cannot promise a particular outcome or the return of any funds.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link href="/start" className="text-zinc-300 hover:text-brass-300">
            Start a case
          </Link>
          <Link href="/login" className="text-zinc-300 hover:text-brass-300">
            Client login
          </Link>
          <a href={`mailto:${siteConfig.contactEmail}`} className="text-zinc-300 hover:text-brass-300">
            {siteConfig.contactEmail}
          </a>
        </div>
      </div>
      <div className="border-t border-white/[0.04]">
        <p className="container-page py-5 text-xs text-zinc-600">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

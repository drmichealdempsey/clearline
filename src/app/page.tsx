import Link from "next/link";
import { SERVICES, startHref } from "@/lib/constants";
import type { ServiceType } from "@/lib/types";
import { RedFlagAssessment } from "@/components/RedFlagAssessment";
import { CheckIcon, EyeIcon, IdIcon, RouteIcon } from "@/components/icons";

const SERVICE_ICONS: Record<ServiceType, typeof EyeIcon> = {
  infidelity: EyeIcon,
  scam_recovery: RouteIcon,
  background_check: IdIcon,
};

const TRUST_PILLS = [
  { emoji: "🔒", label: "Confidential & Encrypted" },
  { emoji: "⚖️", label: "Lawfully Gathered Evidence" },
  { emoji: "🕵️", label: "Licensed Private Investigators" },
];

const STEPS = [
  {
    title: "Confidential Briefing",
    text: "Share the details, timeline and behaviors that concern you, privately and securely.",
  },
  {
    title: "Strategy & Investigator Match",
    text: "A licensed investigator assesses what is realistically achievable, with clear fees agreed up front.",
  },
  {
    title: "Discreet Investigation",
    text: "Surveillance and open-source research carried out lawfully and discreetly.",
  },
  {
    title: "Findings Delivered",
    text: "Download time-stamped photos, activity logs and a clear written summary of what we found from your private client portal.",
  },
];

export default function HomePage() {
  const featured = SERVICES.find((s) => s.featured) ?? SERVICES[0];
  const secondary = SERVICES.filter((s) => s.id !== featured.id);
  const FeaturedIcon = SERVICE_ICONS[featured.id];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="container-page relative pb-14 pt-14 sm:pb-20 sm:pt-24">
          <p className="eyebrow">Relationship &amp; infidelity investigations</p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.4rem] leading-[1.08] tracking-tight sm:text-6xl">
            When Intuition Isn&apos;t Enough.{" "}
            <span className="text-brass-300">Get the Facts You Need.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Discreet, professional relationship and infidelity investigations by licensed
            investigators. Stop living with uncertainty. Get clear, lawfully gathered findings
            delivered to your private client portal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={startHref("infidelity")}
              className="btn-primary w-full px-6 py-3.5 text-base shadow-[0_8px_30px_-8px_rgba(201,169,110,0.55)] sm:w-auto"
            >
              Start a Private Infidelity Case ➔
            </Link>
            <a href="#assessment" className="btn-secondary w-full px-6 py-3.5 text-base sm:w-auto">
              Check the Red Flags
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {TRUST_PILLS.map((pill) => (
              <li
                key={pill.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-300 sm:text-sm"
              >
                <span aria-hidden>{pill.emoji}</span>
                {pill.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Red flag self-check */}
      <section id="assessment" className="container-page scroll-mt-20 py-10 sm:py-14">
        <RedFlagAssessment />
      </section>

      {/* Services */}
      <section id="services" className="container-page scroll-mt-20 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Services</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">How we can help</h2>
          <p className="mt-4 text-zinc-400">
            Every case is reviewed by an investigator before any work starts, so you know what is and
            isn&apos;t realistic before you commit.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-5">
          {/* Featured: infidelity */}
          <article className="card relative flex flex-col border-brass-400/50 bg-gradient-to-b from-brass-400/[0.06] to-transparent p-6 sm:p-8 lg:col-span-3">
            <span className="absolute right-5 top-5 rounded-full bg-brass-400 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-ink-950 sm:right-6 sm:top-6">
              OUR SPECIALTY
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brass-400/10 text-brass-300 ring-1 ring-inset ring-brass-400/30">
              <FeaturedIcon />
            </span>
            <h3 className="mt-5 pr-2 font-display text-2xl tracking-tight sm:text-[1.75rem]">
              {featured.name}
            </h3>
            <p className="mt-3 leading-relaxed text-zinc-400">{featured.description}</p>
            <ul className="mt-6 space-y-3">
              {featured.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[15px] text-zinc-200">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brass-400/15 text-brass-300">
                    <CheckIcon width={13} height={13} strokeWidth={2.4} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Link href={startHref(featured.id)} className="btn-primary w-full px-6 py-3.5 text-base sm:w-auto">
                Start a Private Infidelity Case ➔
              </Link>
            </div>
          </article>

          {/* Secondary services */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {secondary.map((service) => {
              const Icon = SERVICE_ICONS[service.id];
              return (
                <article key={service.id} className="card flex flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-zinc-300">
                      <Icon width={18} height={18} />
                    </span>
                    <h3 className="text-base font-semibold">{service.name}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{service.description}</p>
                  {service.id === "scam_recovery" && (
                    <p className="mt-3 text-xs text-zinc-500">We cannot promise the return of any funds.</p>
                  )}
                  <div className="mt-auto pt-5">
                    <Link href={startHref(service.id)} className="btn-secondary w-full">
                      Start a Case
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            Private from the first message
          </h2>
        </div>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="card p-6">
              <span className="font-display text-3xl text-brass-400/80">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Honest expectations */}
      <section className="container-page py-16 sm:py-20">
        <div className="card relative overflow-hidden p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brass-400/10 blur-3xl" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Straight talk</p>
              <h2 className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">
                What we can and can&apos;t promise
              </h2>
              <p className="mt-4 leading-relaxed text-zinc-400">
                Every investigation is different. We can&apos;t promise a particular outcome, and no
                legitimate investigator can guarantee that lost money will be returned. What we commit
                to is lawful methods, honest communication and a clearly documented report of what we
                find.
              </p>
              <p className="mt-4 leading-relaxed text-zinc-400">
                If you&apos;ve been scammed, be cautious of anyone who contacts you promising guaranteed
                recovery in exchange for an upfront fee. That is a common follow-up scam.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={startHref("infidelity")} className="btn-primary w-full px-6 py-3.5 text-base">
                Start a Private Infidelity Case ➔
              </Link>
              <Link href="/login" className="btn-secondary w-full px-6 py-3.5 text-base">
                Client login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

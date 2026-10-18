import Link from "next/link";
import { siteConfig } from "@/config/site";
import { SERVICES } from "@/lib/constants";
import type { ServiceType } from "@/lib/types";
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  IdIcon,
  LockIcon,
  RouteIcon,
  ScaleIcon,
  FileIcon,
} from "@/components/icons";

const SERVICE_ICONS: Record<ServiceType, typeof EyeIcon> = {
  infidelity: EyeIcon,
  scam_recovery: RouteIcon,
  background_check: IdIcon,
};

const PRINCIPLES = [
  { icon: LockIcon, title: "Confidential by default", text: "Private file storage and a secure client portal." },
  { icon: ScaleIcon, title: "Lawful methods only", text: "We work within the law, every time." },
  { icon: FileIcon, title: "Documented findings", text: "A clear written report of what we found." },
];

const STEPS = [
  {
    title: "Tell us what's happening",
    text: "Choose a service, describe the situation in your own words and attach anything useful.",
  },
  {
    title: "We review and scope",
    text: "An investigator reviews your request, confirms what's realistic and agrees fees with you up front.",
  },
  {
    title: "Follow the work",
    text: "Track status, read updates and share new information through your private dashboard.",
  },
  {
    title: "Receive your report",
    text: "Download a written report of the findings, ready to use with your lawyer, bank or the authorities.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="container-page relative pb-16 pt-16 sm:pb-24 sm:pt-24">
          <p className="eyebrow">{siteConfig.tagline}</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] tracking-tight sm:text-6xl">
            When you need the facts, handled with discretion.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {siteConfig.name} helps people facing difficult situations get clear, documented
            information. Tell us what&apos;s going on, share what you have, and follow every step of
            your case in a private client portal.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/start" className="btn-primary px-6 py-3 text-base">
              Start a Case
              <ArrowRightIcon width={18} height={18} />
            </Link>
            <Link href="#services" className="btn-secondary px-6 py-3 text-base">
              Explore services
            </Link>
          </div>

          <ul className="mt-14 grid gap-4 sm:grid-cols-3">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-brass-300">
                  <Icon width={18} height={18} />
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-100">{title}</p>
                  <p className="text-sm text-zinc-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container-page scroll-mt-20 py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Services</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            Three areas of focus
          </h2>
          <p className="mt-4 text-zinc-400">
            Each case is reviewed by an investigator before any work starts, so you know what is and
            isn&apos;t realistic before you commit.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = SERVICE_ICONS[service.id];
            return (
              <article key={service.id} className="card group flex flex-col p-6 transition hover:border-brass-400/25">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brass-400/10 text-brass-300 ring-1 ring-inset ring-brass-400/20">
                  <Icon />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{service.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{service.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {service.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-brass-400" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <Link href={`/start?service=${service.id}`} className="btn-secondary w-full group-hover:border-brass-400/30">
                    Start a Case
                    <ArrowRightIcon width={16} height={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            A clear process, start to finish
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
              <Link href="/start" className="btn-primary px-6 py-3 text-base">
                Start a Case
                <ArrowRightIcon width={18} height={18} />
              </Link>
              <Link href="/login" className="btn-secondary px-6 py-3 text-base">
                Client login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

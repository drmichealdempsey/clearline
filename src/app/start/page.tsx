import type { Metadata } from "next";
import { isServiceType } from "@/lib/constants";
import { IntakeForm } from "./IntakeForm";

export const metadata: Metadata = { title: "Start a case" };

export default function StartPage({
  searchParams,
}: {
  searchParams: { type?: string; service?: string };
}) {
  // `type` is the current parameter; `service` is still accepted for older links.
  const requested = searchParams.type ?? searchParams.service;
  const initialService = isServiceType(requested) ? requested : null;

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Start a case</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
          Tell us what&apos;s happening
        </h1>
        <p className="mt-3 text-zinc-400">
          Everything you share is stored privately and only seen by you and the investigators working
          on your case. There is no charge to submit a request.
        </p>
        <div className="mt-8">
          <IntakeForm initialService={initialService} />
        </div>
      </div>
    </div>
  );
}

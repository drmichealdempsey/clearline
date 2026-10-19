"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { startHref } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/icons";

// Runs entirely in the browser: nothing here is stored, logged or sent anywhere.

const FLAGS = [
  "Unexplained schedule changes",
  "Sudden password or passcode changes",
  "Guarded phone behavior",
  "Unexplained spending or financial changes",
  "Emotional distance or changed routines",
  "Inconsistent stories",
];

type Urgency = "urgent" | "ongoing";
type Level = "low" | "moderate" | "high";
type Step = 1 | 2 | 3;

const URGENCY_OPTIONS: { id: Urgency; label: string }[] = [
  { id: "urgent", label: "Something happened recently and I need answers soon" },
  { id: "ongoing", label: "I've had doubts for a while" },
];

const RESULTS: Record<Level, { label: string; text: string; cta: string }> = {
  low: {
    label: "Low",
    text: "These signs can have many explanations. A no-obligation conversation with an investigator can help you decide whether an investigation makes sense.",
    cta: "Talk to an Investigator",
  },
  moderate: {
    label: "Moderate",
    text: "Several of these patterns are worth looking into carefully. An investigator can review your situation and tell you what is realistically achievable.",
    cta: "Request a Confidential Review",
  },
  high: {
    label: "High",
    text: "This combination of signs often warrants a professional review. Share your situation privately and an investigator will assess it with you.",
    cta: "Start a Private Infidelity Case ➔",
  },
};

// 4+ flags is high. A recent, urgent situation is also high, provided at least
// one sign was selected; with none selected the "combination of signs" copy would not fit.
function assess(flagCount: number, urgency: Urgency | null): Level {
  if (flagCount >= 4 || (urgency === "urgent" && flagCount >= 1)) return "high";
  if (flagCount >= 2) return "moderate";
  return "low";
}

export function RedFlagAssessment() {
  const [step, setStep] = useState<Step>(1);
  const [flags, setFlags] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  // Move focus to the new step for keyboard and screen reader users (not on first render).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    stepRef.current?.focus({ preventScroll: true });
  }, [step]);

  function toggleFlag(flag: string) {
    setFlags((current) =>
      current.includes(flag) ? current.filter((f) => f !== flag) : [...current, flag],
    );
  }

  function restart() {
    setFlags([]);
    setUrgency(null);
    setStep(1);
  }

  const level = assess(flags.length, urgency);
  const result = RESULTS[level];

  return (
    <div className="card mx-auto max-w-2xl p-5 sm:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Private self-check</p>
        <p className="text-xs text-zinc-500">Step {step} of 3</p>
      </div>
      <h2 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">Do You Need an Investigation?</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Nothing you select here is saved or sent. It stays in your browser.
      </p>

      <ol className="mt-5 grid grid-cols-3 gap-2" aria-label="Progress">
        {([1, 2, 3] as Step[]).map((s) => (
          <li
            key={s}
            aria-current={s === step ? "step" : undefined}
            className={cn(
              "h-1 rounded-full motion-safe:transition-colors",
              s <= step ? "bg-brass-400" : "bg-white/[0.08]",
            )}
          >
            <span className="sr-only">Step {s}</span>
          </li>
        ))}
      </ol>

      <div ref={stepRef} tabIndex={-1} className="mt-6 focus:outline-none">
        {step === 1 && (
          <fieldset>
            <legend className="text-base font-medium text-zinc-100">
              Which of these have you noticed?
            </legend>
            <p className="mt-1 text-sm text-zinc-500">Select all that apply, or none.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {FLAGS.map((flag) => {
                const checked = flags.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleFlag(flag)}
                    className={cn(
                      "flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm motion-safe:transition-colors",
                      checked
                        ? "border-brass-400/60 bg-brass-400/[0.08] text-zinc-50"
                        : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                        checked ? "border-brass-400 bg-brass-400 text-ink-950" : "border-white/25",
                      )}
                      aria-hidden
                    >
                      {checked && <CheckIcon width={13} height={13} strokeWidth={2.6} />}
                    </span>
                    {flag}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="text-base font-medium text-zinc-100">Which feels closer to your situation?</legend>
            <div className="mt-4 grid gap-2" role="radiogroup">
              {URGENCY_OPTIONS.map((option) => {
                const selected = urgency === option.id;
                const urgent = option.id === "urgent";
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setUrgency(option.id)}
                    className={cn(
                      "flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm motion-safe:transition-colors",
                      selected && urgent && "border-rose-400/40 bg-rose-500/[0.07] text-zinc-50",
                      selected && !urgent && "border-brass-400/60 bg-brass-400/[0.08] text-zinc-50",
                      !selected && "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                        selected ? (urgent ? "border-rose-300" : "border-brass-400") : "border-white/25",
                      )}
                      aria-hidden
                    >
                      {selected && (
                        <span className={cn("h-2.5 w-2.5 rounded-full", urgent ? "bg-rose-300" : "bg-brass-400")} />
                      )}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                disabled={!urgency}
                onClick={() => setStep(3)}
              >
                See my result
              </button>
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <div aria-live="polite">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-zinc-400">Indicator:</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                  level === "high"
                    ? "bg-rose-500/10 text-rose-200 ring-rose-400/25"
                    : "bg-brass-400/10 text-brass-200 ring-brass-400/25",
                )}
              >
                {result.label}
              </span>
              <span className="text-zinc-500">
                · {flags.length} of {FLAGS.length} signs selected
              </span>
            </div>
            <p className="mt-4 text-base leading-relaxed text-zinc-200">{result.text}</p>
            <Link href={startHref("infidelity")} className="btn-primary mt-6 w-full px-6 py-3.5 text-base sm:w-auto">
              {result.cta}
            </Link>
            <p className="mt-5 text-xs text-zinc-500">
              This is a general guide, not a conclusion about your partner.
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-2 inline-flex min-h-[44px] items-center text-sm text-brass-300 hover:underline"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

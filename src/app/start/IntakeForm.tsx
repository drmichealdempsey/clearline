"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { SERVICES, isServiceType, serviceName } from "@/lib/constants";
import { uploadCaseFile, validateFiles } from "@/lib/files";
import type { Role, ServiceType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AuthForm } from "@/components/AuthForm";
import { FilePicker } from "@/components/FilePicker";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/icons";

// Text fields are kept on this device so nothing is lost if the visitor has to
// confirm their email first. Files cannot be persisted and must be re-attached.
const DRAFT_KEY = "clearline:intake-draft";

type Step = 1 | 2 | 3;
const STEP_LABELS: Record<Step, string> = { 1: "Service", 2: "Details", 3: "Account & submit" };

interface Draft {
  service: ServiceType | null;
  title: string;
  description: string;
}

export function IntakeForm({ initialService }: { initialService: ServiceType | null }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<Step>(initialService ? 2 : 1);
  const [service, setService] = useState<ServiceType | null>(initialService);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [restored, setRestored] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore any saved draft and detect an existing session.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<Draft>;
        if (!initialService && isServiceType(draft.service)) {
          setService(draft.service);
          setStep(2);
        }
        if (typeof draft.title === "string") setTitle(draft.title);
        if (typeof draft.description === "string") setDescription(draft.description);
        if (draft.title || draft.description) setRestored(true);
      }
    } catch {
      // Storage unavailable; continue without a draft.
    }
    setDraftLoaded(true);

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUser(data.user);
      setRole(await fetchRole(data.user.id));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ service, title, description } satisfies Draft));
    } catch {
      // Ignore storage errors.
    }
  }, [draftLoaded, service, title, description]);

  async function fetchRole(userId: string): Promise<Role> {
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
    return (data?.role as Role | undefined) ?? "client";
  }

  function detailsError(): string | null {
    if (title.trim().length < 3) return "Please add a short title (at least 3 characters).";
    if (description.trim().length < 20)
      return "Please describe the situation in a little more detail (at least 20 characters).";
    return validateFiles(files);
  }

  async function submitCase(currentUser: User) {
    setError(null);
    const currentRole = role ?? (await fetchRole(currentUser.id));
    if (currentRole === "investigator") {
      setError("You're signed in as an investigator. Log in with a client account to submit a case.");
      return;
    }
    if (!service) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    const { data, error: insertError } = await supabase
      .from("cases")
      .insert({
        client_id: currentUser.id,
        service_type: service,
        title: title.trim(),
        description: description.trim(),
      })
      .select("id")
      .single();

    if (insertError || !data) {
      setSubmitting(false);
      setError(insertError?.message ?? "We couldn't create your case. Please try again.");
      return;
    }

    let failed = 0;
    for (const file of files) {
      const err = await uploadCaseFile(supabase, {
        caseId: data.id,
        userId: currentUser.id,
        file,
        kind: "supporting",
      });
      if (err) failed++;
    }

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore.
    }

    const params = new URLSearchParams({ submitted: "1" });
    if (failed) params.set("failed", String(failed));
    router.push(`/dashboard/cases/${data.id}?${params.toString()}`);
    router.refresh();
  }

  async function handleAuthenticated(authedUser: User) {
    setUser(authedUser);
    const r = await fetchRole(authedUser.id);
    setRole(r);
    await submitCase(authedUser);
  }

  return (
    <div>
      {/* Step indicator */}
      <ol className="mb-6 grid grid-cols-3 gap-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <li key={s}>
            <div
              className={cn(
                "h-1 rounded-full transition-colors",
                s <= step ? "bg-brass-400" : "bg-white/[0.08]",
              )}
            />
            <p
              className={cn(
                "mt-2 text-[11px] font-medium uppercase tracking-wide sm:text-xs",
                s === step ? "text-zinc-100" : "text-zinc-500",
              )}
            >
              {STEP_LABELS[s]}
            </p>
          </li>
        ))}
      </ol>

      {restored && step !== 3 && (
        <p className="alert-info mb-5">
          We restored the details you started earlier on this device. Files need to be attached again.
        </p>
      )}

      {/* Step 1: service */}
      {step === 1 && (
        <div className="space-y-3">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setService(s.id);
                setStep(2);
              }}
              className={cn(
                "card flex w-full items-start gap-4 p-5 text-left transition hover:border-brass-400/30",
                service === s.id && "border-brass-400/50 bg-brass-400/[0.04]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                  service === s.id ? "border-brass-400 bg-brass-400 text-ink-950" : "border-white/20",
                )}
              >
                {service === s.id && <CheckIcon width={12} height={12} strokeWidth={2.5} />}
              </span>
              <span>
                <span className="block font-medium text-zinc-100">{s.name}</span>
                <span className="mt-1 block text-sm leading-relaxed text-zinc-400">{s.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: details */}
      {step === 2 && (
        <form
          className="card space-y-6 p-5 sm:p-7"
          onSubmit={(e) => {
            e.preventDefault();
            const problem = detailsError();
            if (problem) {
              setError(problem);
              return;
            }
            setError(null);
            setStep(3);
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-400">
              Service: <span className="font-medium text-zinc-100">{service && serviceName(service)}</span>
            </p>
            <button type="button" className="text-sm text-brass-300 hover:underline" onClick={() => setStep(1)}>
              Change
            </button>
          </div>

          <div>
            <label className="label" htmlFor="title">
              Short title
            </label>
            <input
              id="title"
              className="input"
              placeholder="e.g. Investment platform stopped responding"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="description">
              Describe the situation
            </label>
            <textarea
              id="description"
              className="input min-h-[180px] resize-y"
              placeholder="What happened, when it started, who is involved, and what you'd like to find out."
              maxLength={10000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="hint">
              Include names, dates, usernames, websites or transaction references if you have them.
              Please don&apos;t share passwords or full card numbers.
            </p>
          </div>

          <div>
            <p className="label">Supporting files (optional)</p>
            <FilePicker files={files} onChange={setFiles} />
          </div>

          {error && <p className="alert-error">{error}</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
              <ArrowLeftIcon width={16} height={16} />
              Back
            </button>
            <button type="submit" className="btn-primary">
              Continue
              <ArrowRightIcon width={16} height={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: account & submit */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="card p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Review</h2>
              <button
                type="button"
                className="text-sm text-brass-300 hover:underline"
                onClick={() => setStep(2)}
                disabled={submitting}
              >
                Edit
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">Service</dt>
                <dd className="text-zinc-100">{service && serviceName(service)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Title</dt>
                <dd className="text-zinc-100">{title}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Description</dt>
                <dd className="line-clamp-4 whitespace-pre-wrap text-zinc-300">{description}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Files</dt>
                <dd className="text-zinc-100">
                  {files.length ? `${files.length} attached` : "None"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-5 sm:p-7">
            {user ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Signed in as <span className="text-zinc-100">{user.email}</span>
                </p>
                {error && <p className="alert-error">{error}</p>}
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={submitting}
                  onClick={() => submitCase(user)}
                >
                  {submitting ? "Submitting your case…" : "Submit case"}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-base font-semibold">Create an account or log in</h2>
                <p className="mb-5 mt-1 text-sm text-zinc-400">
                  You&apos;ll use it to follow progress, read updates and download your report.
                </p>
                {error && <p className="alert-error mb-4">{error}</p>}
                {submitting ? (
                  <p className="alert-info">Submitting your case…</p>
                ) : (
                  <AuthForm
                    initialMode="signup"
                    next="/start"
                    onAuthenticated={handleAuthenticated}
                    confirmationNote="Check your inbox to confirm your email. The link brings you back here: your written details are saved on this device, but you'll need to re-attach any files before submitting."
                  />
                )}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-zinc-500">
            Submitting a request doesn&apos;t commit you to anything. An investigator will review it and
            confirm scope and fees before any work begins.
          </p>
        </div>
      )}
    </div>
  );
}

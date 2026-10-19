import type { CaseStatus, ServiceType } from "./types";

export interface ServiceInfo {
  id: ServiceType;
  name: string;
  description: string;
  points: string[];
  featured?: boolean;
}

export const SERVICES: ServiceInfo[] = [
  {
    id: "infidelity",
    name: "Relationship & Infidelity Investigations",
    featured: true,
    description:
      "When something doesn't feel right, you deserve facts rather than more sleepless nights. We find out what is really happening, lawfully and discreetly.",
    points: [
      "Discreet surveillance and timeline verification",
      "Digital footprint and public profile analysis (OSINT)",
      "Date and location verified photo and video evidence",
      "Pre-marital background and lifestyle checks",
    ],
  },
  {
    id: "scam_recovery",
    name: "Scam & Fraud Tracing",
    description:
      "We investigate online fraud, trace where we lawfully can, and prepare an evidence pack for your bank, platform or law enforcement.",
    points: [
      "Timeline and evidence assembly",
      "Identity, domain and wallet tracing",
      "Report formatted for referral to authorities",
    ],
  },
  {
    id: "background_check",
    name: "Background Checks",
    description:
      "Verify who you are dealing with: a new partner, a business contact or a private party, within what the law permits.",
    points: [
      "Identity and address verification",
      "Public records and court searches",
      "Company and directorship checks",
    ],
  },
];

export const SERVICE_IDS = SERVICES.map((s) => s.id);

// Every "Start" CTA links here so the intake form opens with the service preselected.
export function startHref(id: ServiceType): string {
  return `/start?type=${id}`;
}

export function serviceName(id: ServiceType): string {
  return SERVICES.find((s) => s.id === id)?.name ?? id;
}

export function isServiceType(value: unknown): value is ServiceType {
  return typeof value === "string" && (SERVICE_IDS as string[]).includes(value);
}

export interface StatusInfo {
  id: CaseStatus;
  label: string;
  clientDescription: string;
}

// Ordered: the progress bar follows this order.
export const CASE_STATUSES: StatusInfo[] = [
  {
    id: "received",
    label: "Received",
    clientDescription: "We have your request and are reviewing the details you shared.",
  },
  {
    id: "assigned",
    label: "Assigned",
    clientDescription: "An investigator has been assigned and will confirm the scope with you.",
  },
  {
    id: "in_progress",
    label: "In progress",
    clientDescription: "Your investigator is actively working on the case. Updates will appear below.",
  },
  {
    id: "report_ready",
    label: "Report ready",
    clientDescription: "Your written report is ready to download.",
  },
  {
    id: "closed",
    label: "Closed",
    clientDescription: "This case is closed. Your files and report remain available here.",
  },
];

export function statusInfo(id: CaseStatus): StatusInfo {
  return CASE_STATUSES.find((s) => s.id === id) ?? CASE_STATUSES[0];
}

export function statusIndex(id: CaseStatus): number {
  return Math.max(
    0,
    CASE_STATUSES.findIndex((s) => s.id === id),
  );
}

export function isCaseStatus(value: unknown): value is CaseStatus {
  return typeof value === "string" && CASE_STATUSES.some((s) => s.id === value);
}

export function isReportReleased(status: CaseStatus): boolean {
  return status === "report_ready" || status === "closed";
}

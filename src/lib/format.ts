import { siteConfig } from "@/config/site";

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(siteConfig.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(siteConfig.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
  }).format(amount);
}

export function firstName(fullName: string | null | undefined): string | null {
  const first = fullName?.trim().split(/\s+/)[0];
  return first || null;
}

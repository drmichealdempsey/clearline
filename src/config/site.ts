// Brand and app-wide settings. Change the name here and it updates everywhere.
export const siteConfig = {
  name: "ClearLine Investigations",
  shortName: "ClearLine",
  tagline: "Discreet, lawful private investigation.",
  description:
    "Confidential private investigation for relationship concerns, online scams and background checks, with a secure client portal to follow your case.",
  contactEmail: "cases@example.com",
  // Private Supabase Storage bucket (created by the SQL migration).
  storageBucket: "case-files",
  currency: "USD",
  locale: "en-US",
} as const;

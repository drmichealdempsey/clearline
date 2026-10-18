export type Role = "client" | "investigator";
export type ServiceType = "infidelity" | "scam_recovery" | "background_check";
export type CaseStatus = "received" | "assigned" | "in_progress" | "report_ready" | "closed";
export type PaymentStatus = "pending" | "paid";
export type FileKind = "supporting" | "report";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  created_at: string;
}

export interface Case {
  id: string;
  client_id: string;
  service_type: ServiceType;
  title: string;
  description: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface CaseUpdate {
  id: string;
  case_id: string;
  author_id: string;
  message: string;
  created_at: string;
}

export interface CaseFile {
  id: string;
  case_id: string;
  uploaded_by: string;
  file_path: string;
  file_name: string;
  kind: FileKind;
  created_at: string;
}

export interface Payment {
  id: string;
  case_id: string;
  milestone_name: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

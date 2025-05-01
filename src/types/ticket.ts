export enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
}

export enum IssueType {
  VPN = "vpn",
  QUARANTINED = "quarantined",
  MFA = "mfa",
  OTHER = "other",
}

export interface Attachment {
  id: number;
  ticket_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface TicketBase {
  title: string;
  description: string;
  device_name?: string;
  location?: string;
  issue_type: IssueType;
}

export interface TicketCreate extends TicketBase {}

export interface TicketUpdate {
  title?: string;
  description?: string;
  device_name?: string;
  location?: string;
  issue_type?: IssueType;
  status?: TicketStatus;
}

export interface Ticket extends TicketBase {
  id: number;
  status: TicketStatus;
  created_by: number;
  assigned_to?: number;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  attachments: Attachment[];
  creator_name: string;
  assignee_name?: string;
}

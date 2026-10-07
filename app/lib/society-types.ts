export type UserRole = "resident" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  flatNumber?: string;
  wing?: string;
  initials: string;
}

export type PriorityLevel = "Low" | "Medium" | "High" | "Urgent";

export type ComplaintStatus =
  | "Submitted"
  | "Needs Triage"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Closed";

export type ComplaintCategory =
  | "Elevator"
  | "Plumbing"
  | "Electrical"
  | "Security"
  | "Cleanliness"
  | "Infrastructure"
  | "Noise"
  | "Parking"
  | "Other";

export interface AIRecommendation {
  category: ComplaintCategory;
  priority: PriorityLevel;
  reason: string;
  confidence: number; // e.g. 96
  analyzedAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: PriorityLevel;
  status: ComplaintStatus;
  residentId: string;
  residentName: string;
  residentEmail: string;
  residentPhone?: string;
  flatNumber: string;
  wing: string;
  preferredTimingSlot: string;
  createdAt: string;
  updatedAt: string;
  assignedHandlerId?: string;
  assignedHandlerName?: string;
  aiRecommendation: AIRecommendation;
  adminNotes?: string;
  isUrgent?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  badgeText: string;
  badgeType: "success" | "info" | "warning";
  targetWing: string; // e.g. "All Wings", "Wing A", "Wing B", "Wing C"
  publishedAt: string;
  isNew: boolean;
}

export interface ComplaintHandler {
  id: string;
  name: string;
  department: ComplaintCategory;
  phone: string;
  activeTasks: number;
  status: "Available" | "On Duty" | "Busy";
}

export interface House {
  id: string;
  flatNumber: string;
  wing: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  occupancyType: "Owner" | "Tenant";
  activeComplaints: number;
}

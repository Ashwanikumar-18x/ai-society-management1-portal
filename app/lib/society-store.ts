import {
  User,
  Complaint,
  Notice,
  ComplaintHandler,
  House,
  PriorityLevel,
  ComplaintStatus,
  AIRecommendation,
} from "./society-types";
import { computeSemanticAIRecommendation } from "./ai-service";

const STORAGE_KEYS = {
  CURRENT_USER: "society_current_user",
  REGISTERED_USERS: "society_registered_users",
  COMPLAINTS: "society_complaints",
  NOTICES: "society_notices",
  HANDLERS: "society_handlers",
  HOUSES: "society_houses",
  INITIALIZED: "society_seed_initialized_v4",
};

// Seed Users
const SEED_USERS: User[] = [
  {
    id: "user-resident-1",
    name: "Resident",
    email: "resident.1789882182@example.com",
    role: "resident",
    phone: "Add a phone number",
    flatNumber: "Flat C-110",
    wing: "Wing C",
    initials: "RY",
  },
  {
    id: "user-resident-2",
    name: "Smoke Resident",
    email: "smoke.resident@example.com",
    role: "resident",
    phone: "+1 (555) 014-9982",
    flatNumber: "Flat B-304",
    wing: "Wing B",
    initials: "SR",
  },
  {
    id: "user-admin-1",
    name: "Society Admin",
    email: "admin@society.com",
    role: "admin",
    phone: "+1 (555) 999-0000",
    initials: "AD",
  },
];

// Seed Handlers
const SEED_HANDLERS: ComplaintHandler[] = [
  {
    id: "h1",
    name: "Arjun Mehta",
    department: "Plumbing",
    phone: "+91 98201 23456",
    activeTasks: 2,
    status: "On Duty",
  },
  {
    id: "h2",
    name: "Suresh Kumar",
    department: "Electrical",
    phone: "+91 98202 34567",
    activeTasks: 1,
    status: "Available",
  },
  {
    id: "h3",
    name: "Ramesh Patil",
    department: "Elevator",
    phone: "+91 98203 45678",
    activeTasks: 1,
    status: "On Duty",
  },
  {
    id: "h4",
    name: "Vikram Singh",
    department: "Infrastructure",
    phone: "+91 98204 56789",
    activeTasks: 1,
    status: "Available",
  },
  {
    id: "h5",
    name: "Pooja Sharma",
    department: "Cleanliness",
    phone: "+91 98205 67890",
    activeTasks: 0,
    status: "Available",
  },
];

// Seed Complaints matching Screenshot 1 & 2
const SEED_COMPLAINTS: Complaint[] = [
  {
    id: "1ADF54",
    title: "Elevator stopping between floors",
    description:
      "The elevator is stuck between floors and residents cannot safely use it.",
    category: "Elevator",
    priority: "Urgent",
    status: "Submitted",
    residentId: "user-resident-1",
    residentName: "Resident",
    residentEmail: "resident.1789882182@example.com",
    residentPhone: "Add a phone number",
    flatNumber: "Flat C-110",
    wing: "Wing C",
    preferredTimingSlot: "Immediate",
    createdAt: "20 Sept 2026",
    updatedAt: "20 Sept 2026",
    aiRecommendation: {
      category: "Elevator",
      priority: "Urgent",
      reason:
        "The elevator is reported stuck or stopping between floors, posing an immediate resident safety risk that requires immediate emergency technician dispatch.",
      confidence: 97,
      analyzedAt: "2026-09-20T07:45:00Z",
    },
  },
  {
    id: "914B7F",
    title: "Elevator stopping between floors",
    description:
      "Elevator door sensor failure and abrupt stops between 4th and 5th floors with jerky vibrations.",
    category: "Elevator",
    priority: "Urgent",
    status: "Submitted",
    residentId: "user-resident-1",
    residentName: "Resident",
    residentEmail: "resident.1789882182@example.com",
    residentPhone: "Add a phone number",
    flatNumber: "Flat C-110",
    wing: "Wing C",
    preferredTimingSlot: "Morning (09:00 AM - 12:00 PM)",
    createdAt: "20 Sept 2026",
    updatedAt: "20 Sept 2026",
    aiRecommendation: {
      category: "Elevator",
      priority: "Urgent",
      reason:
        "Repeated mechanical halt between floor levels. High passenger risk requires physical elevator shutdown and technician inspection.",
      confidence: 98,
      analyzedAt: "2026-09-20T07:15:00Z",
    },
  },
  {
    id: "54187D",
    title: "Water leak near lobby",
    description:
      "There is a visible water leak near the lobby entrance and the floor is becoming unsafe.",
    category: "Plumbing",
    priority: "High",
    status: "Assigned",
    residentId: "user-resident-2",
    residentName: "Smoke Resident",
    residentEmail: "smoke.resident@example.com",
    residentPhone: "+1 (555) 014-9982",
    flatNumber: "Flat B-304",
    wing: "Wing B",
    preferredTimingSlot: "Morning (09:00 AM - 12:00 PM)",
    createdAt: "20 Sept 2026",
    updatedAt: "20 Sept, 05:29 am",
    assignedHandlerId: "h1",
    assignedHandlerName: "Arjun Mehta",
    aiRecommendation: {
      category: "Plumbing",
      priority: "High",
      reason:
        "Visible water leak near the lobby indicates a plumbing-related issue, and the wet floor near an entrance creates a safety hazard that requires prompt attention.",
      confidence: 96,
      analyzedAt: "2026-09-20T05:29:00Z",
    },
  },
  {
    id: "C39A12",
    title: "Basement drainage backup",
    description:
      "Drainage water accumulating near parking bay B-12 causing foul smell and stagnant puddle.",
    category: "Plumbing",
    priority: "Urgent",
    status: "Assigned",
    residentId: "user-3",
    residentName: "Vikram Roy",
    residentEmail: "vikram.roy@example.com",
    residentPhone: "+1 (555) 011-8822",
    flatNumber: "Flat B-102",
    wing: "Wing B",
    preferredTimingSlot: "Afternoon (12:00 PM - 03:00 PM)",
    createdAt: "21 Sept 2026",
    updatedAt: "21 Sept 2026",
    assignedHandlerId: "h1",
    assignedHandlerName: "Arjun Mehta",
    aiRecommendation: {
      category: "Plumbing",
      priority: "Urgent",
      reason:
        "Basement water accumulation creates sanitation risks and vehicle slippage. Urgent sump inspection needed.",
      confidence: 95,
      analyzedAt: "2026-09-21T02:40:00Z",
    },
  },
  {
    id: "8B22D1",
    title: "Security main gate sensor glitch",
    description:
      "Automatic boom barrier not detecting resident RFID tags reliably, causing vehicular backup at entrance.",
    category: "Security",
    priority: "High",
    status: "Needs Triage",
    residentId: "user-4",
    residentName: "Kavita Rao",
    residentEmail: "kavita.rao@example.com",
    residentPhone: "+1 (555) 017-3341",
    flatNumber: "Flat C-404",
    wing: "Wing C",
    preferredTimingSlot: "Evening (03:00 PM - 06:00 PM)",
    createdAt: "21 Sept 2026",
    updatedAt: "21 Sept 2026",
    aiRecommendation: {
      category: "Security",
      priority: "High",
      reason:
        "Entry gate boom barrier failure compromises access security and creates entrance traffic congestion.",
      confidence: 94,
      analyzedAt: "2026-09-21T06:10:00Z",
    },
  },
];

// Seed Notices matching Screenshot 1
const SEED_NOTICES: Notice[] = [
  {
    id: "n1",
    title: "Overhead tank valves serviced",
    description: "Overhead tank valves are serviced.",
    badgeText: "Complaint registered and triaged",
    badgeType: "success",
    targetWing: "All Wings",
    publishedAt: "20 Sept 2026",
    isNew: true,
  },
  {
    id: "n2",
    title: "Elevator Annual Safety Audit",
    description:
      "Annual elevator safety certification scheduled for Wing C this Friday.",
    badgeText: "Scheduled Maintenance",
    badgeType: "info",
    targetWing: "Wing C",
    publishedAt: "21 Sept 2026",
    isNew: true,
  },
  {
    id: "n3",
    title: "Monsoon Storm Drain Clearing Completed",
    description:
      "All perimeter stormwater drains have been cleared and checked.",
    badgeText: "Maintenance Completed",
    badgeType: "success",
    targetWing: "All Wings",
    publishedAt: "18 Sept 2026",
    isNew: false,
  },
];

// Seed Houses
const SEED_HOUSES: House[] = [
  {
    id: "house-1",
    flatNumber: "Flat C-110",
    wing: "Wing C",
    ownerName: "Resident",
    ownerEmail: "resident.1789882182@example.com",
    ownerPhone: "+1 (555) 019-2834",
    occupancyType: "Owner",
    activeComplaints: 2,
  },
  {
    id: "house-2",
    flatNumber: "Flat B-304",
    wing: "Wing B",
    ownerName: "Smoke Resident",
    ownerEmail: "resident.1789882182@example.com",
    ownerPhone: "+1 (555) 014-9982",
    occupancyType: "Owner",
    activeComplaints: 1,
  },
  {
    id: "house-3",
    flatNumber: "Flat A-201",
    wing: "Wing A",
    ownerName: "Amit Sharma",
    ownerEmail: "amit.sharma@example.com",
    ownerPhone: "+1 (555) 012-3490",
    occupancyType: "Tenant",
    activeComplaints: 0,
  },
  {
    id: "house-4",
    flatNumber: "Flat B-102",
    wing: "Wing B",
    ownerName: "Vikram Roy",
    ownerEmail: "vikram.roy@example.com",
    ownerPhone: "+1 (555) 011-8822",
    occupancyType: "Owner",
    activeComplaints: 1,
  },
  {
    id: "house-5",
    flatNumber: "Flat C-404",
    wing: "Wing C",
    ownerName: "Kavita Rao",
    ownerEmail: "kavita.rao@example.com",
    ownerPhone: "+1 (555) 017-3341",
    occupancyType: "Owner",
    activeComplaints: 1,
  },
];

class SocietyStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private ensureInitialized() {
    if (!this.isClient()) return;
    try {
      const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!initialized) {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(SEED_USERS));
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(SEED_COMPLAINTS));
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(SEED_NOTICES));
        localStorage.setItem(STORAGE_KEYS.HANDLERS, JSON.stringify(SEED_HANDLERS));
        localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(SEED_HOUSES));
        // Default to Resident view as in Screenshot 1
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Current User
  public getCurrentUser(): User | null {
    if (!this.isClient()) return SEED_USERS[0];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return SEED_USERS[0];
    }
  }

  public setCurrentUser(user: User | null) {
    if (!this.isClient()) return;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      this.notify();
    } catch {}
  }

  // Update profile
  public updateProfile(updated: Partial<User>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const newProfile = { ...current, ...updated };
    this.setCurrentUser(newProfile);

    // Also update in registered users
    const users = this.getRegisteredUsers().map((u) =>
      u.id === newProfile.id ? newProfile : u
    );
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    } catch {}

    this.notify();
    return newProfile;
  }

  // Registered Users
  public getRegisteredUsers(): User[] {
    if (!this.isClient()) return SEED_USERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      return data ? JSON.parse(data) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  }

  public registerResident(data: {
    name: string;
    email: string;
    phone: string;
    flatNumber: string;
    wing: string;
  }): User {
    const initials = data.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RS";

    const newUser: User = {
      id: `resident-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: "resident",
      phone: data.phone,
      flatNumber: data.flatNumber,
      wing: data.wing,
      initials,
    };

    const users = [...this.getRegisteredUsers(), newUser];
    if (this.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
      } catch {}
    }
    this.setCurrentUser(newUser);
    return newUser;
  }

  // Complaints
  public getComplaints(): Complaint[] {
    if (!this.isClient()) return SEED_COMPLAINTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      return data ? JSON.parse(data) : SEED_COMPLAINTS;
    } catch {
      return SEED_COMPLAINTS;
    }
  }

  public addComplaint(params: {
    title: string;
    description: string;
    category?: string;
    location?: string;
    preferredTimingSlot?: string;
    resident: User;
    aiRecommendation?: AIRecommendation;
  }): Complaint {
    const ai =
      params.aiRecommendation ||
      computeSemanticAIRecommendation({
        title: params.title,
        description: params.description,
        category: params.category,
        location: params.location,
      });

    const randomHex = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, "0");

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const newComplaint: Complaint = {
      id: randomHex,
      title: params.title,
      description: params.description,
      category: (params.category as any) || ai.category,
      priority: ai.priority,
      status: "Submitted",
      residentId: params.resident.id,
      residentName: params.resident.name,
      residentEmail: params.resident.email,
      residentPhone: params.resident.phone,
      flatNumber: params.resident.flatNumber || params.location || "Flat C-110",
      wing: params.resident.wing || "Wing C",
      preferredTimingSlot:
        params.preferredTimingSlot || "Morning (09:00 AM - 12:00 PM)",
      createdAt: formattedDate,
      updatedAt: formattedDate,
      aiRecommendation: ai,
    };

    const complaints = [newComplaint, ...this.getComplaints()];
    if (this.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
      } catch {}
    }
    this.notify();
    return newComplaint;
  }

  public updateComplaintStatus(id: string, status: ComplaintStatus) {
    const complaints = this.getComplaints().map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            updatedAt: new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          }
        : c
    );
    if (this.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
      } catch {}
    }
    this.notify();
  }

  public updateComplaintPriority(id: string, priority: PriorityLevel) {
    const complaints = this.getComplaints().map((c) =>
      c.id === id ? { ...c, priority } : c
    );
    if (this.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
      } catch {}
    }
    this.notify();
  }

  public assignHandler(id: string, handlerId: string, handlerName: string) {
    const complaints = this.getComplaints().map((c) =>
      c.id === id
        ? {
            ...c,
            assignedHandlerId: handlerId,
            assignedHandlerName: handlerName,
            status: (c.status === "Submitted" || c.status === "Needs Triage" ? "Assigned" : c.status) as ComplaintStatus,
          }
        : c
    );
    if (this.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
      } catch {}
    }
    this.notify();
  }

  // Notices
  public getNotices(): Notice[] {
    if (!this.isClient()) return SEED_NOTICES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      return data ? JSON.parse(data) : SEED_NOTICES;
    } catch {
      return SEED_NOTICES;
    }
  }

  public addNotice(notice: {
    title: string;
    description: string;
    badgeText?: string;
    badgeType?: "success" | "info" | "warning";
    targetWing?: string;
  }): Notice {
    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      title: notice.title,
      description: notice.description,
      badgeText: notice.badgeText || "Community Update",
      badgeType: notice.badgeType || "info",
      targetWing: notice.targetWing || "All Wings",
      publishedAt: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      isNew: true,
    };

    const notices = [newNotice, ...this.getNotices()];
    if (this.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
      } catch {}
    }
    this.notify();
    return newNotice;
  }

  // Handlers
  public getHandlers(): ComplaintHandler[] {
    if (!this.isClient()) return SEED_HANDLERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HANDLERS);
      return data ? JSON.parse(data) : SEED_HANDLERS;
    } catch {
      return SEED_HANDLERS;
    }
  }

  // Houses
  public getHouses(): House[] {
    if (!this.isClient()) return SEED_HOUSES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOUSES);
      return data ? JSON.parse(data) : SEED_HOUSES;
    } catch {
      return SEED_HOUSES;
    }
  }

  // Reset to seed data
  public resetToSeed() {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(SEED_USERS));
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(SEED_COMPLAINTS));
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(SEED_NOTICES));
      localStorage.setItem(STORAGE_KEYS.HANDLERS, JSON.stringify(SEED_HANDLERS));
      localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(SEED_HOUSES));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_USERS[0]));
      this.notify();
    } catch {}
  }
}

export const societyStore = new SocietyStore();

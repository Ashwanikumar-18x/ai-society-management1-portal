import { useState, useEffect } from "react";
import { APP_TITLE } from "@/lib/app-config";
import { societyStore } from "@/lib/society-store";
import { User } from "@/lib/society-types";
import { ResidentDashboard } from "@/components/resident/ResidentDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SplitLoginPage } from "@/components/auth/SplitLoginPage";

export function meta() {
  return [
    { title: APP_TITLE },
    {
      name: "description",
      content:
        "AI Based Society Management Portal for modern residential communities.",
    },
  ];
}

export default function HomeRoute() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial fetch from store
    const user = societyStore.getCurrentUser();
    setCurrentUser(user);
    setIsReady(true);

    // Subscribe to store updates
    const unsubscribe = societyStore.subscribe(() => {
      setCurrentUser(societyStore.getCurrentUser());
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in -> Split Login Page
  if (!currentUser) {
    return (
      <SplitLoginPage
        onLoginSuccess={(user) => {
          societyStore.setCurrentUser(user);
          setCurrentUser(user);
        }}
      />
    );
  }

  // Admin Dashboard
  if (currentUser.role === "admin") {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onSignOut={() => {
          societyStore.setCurrentUser(null);
          setCurrentUser(null);
        }}
        onSwitchToResident={() => {
          const registered = societyStore.getRegisteredUsers();
          const resident =
            registered.find((u) => u.role === "resident") || {
              id: "user-resident-1",
              name: "Resident",
              email: "resident.1789882182@example.com",
              role: "resident" as const,
              phone: "+1 (555) 019-2834",
              flatNumber: "Flat C-110",
              wing: "Wing C",
              initials: "RY",
            };
          societyStore.setCurrentUser(resident);
          setCurrentUser(resident);
        }}
      />
    );
  }

  // Resident Dashboard
  return (
    <ResidentDashboard
      currentUser={currentUser}
      onSignOut={() => {
        societyStore.setCurrentUser(null);
        setCurrentUser(null);
      }}
      onSwitchToAdmin={() => {
        const adminUser: User = {
          id: "admin-1",
          name: "Society Admin",
          email: "admin@society.com",
          role: "admin",
          phone: "+1 (555) 999-0000",
          initials: "AD",
        };
        societyStore.setCurrentUser(adminUser);
        setCurrentUser(adminUser);
      }}
    />
  );
}

import { useState, useEffect } from "react";
import {
  IconSpeakerphone,
  IconFileText,
  IconClock,
  IconCircleCheck,
  IconBell,
  IconArrowRight,
  IconFilter,
  IconPlus,
  IconEdit,
  IconCalendar,
  IconCheck,
  IconShield,
  IconBuildingCommunity,
  IconX,
} from "@tabler/icons-react";
import { User, Complaint, Notice } from "@/lib/society-types";
import { societyStore } from "@/lib/society-store";
import { RegisterComplaintModal } from "./RegisterComplaintModal";
import { ComplaintDetailModal } from "./ComplaintDetailModal";

interface ResidentDashboardProps {
  currentUser: User;
  onSignOut: () => void;
  onSwitchToAdmin: () => void;
}

export function ResidentDashboard({
  currentUser,
  onSignOut,
  onSwitchToAdmin,
}: ResidentDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All statuses");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Profile edit states
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone || "");
  const [editFlat, setEditFlat] = useState(currentUser.flatNumber || "");
  const [editWing, setEditWing] = useState(currentUser.wing || "");

  // Load data and subscribe to changes
  useEffect(() => {
    const update = () => {
      setComplaints(societyStore.getComplaints());
      setNotices(societyStore.getNotices());
    };
    update();
    return societyStore.subscribe(update);
  }, []);

  // Filter complaints for this resident
  const residentComplaints = complaints.filter(
    (c) =>
      c.residentId === currentUser.id ||
      c.residentName.toLowerCase() === currentUser.name.toLowerCase()
  );

  // If no specific complaints found, fallback to all resident's default
  const displayComplaints =
    residentComplaints.length > 0
      ? residentComplaints
      : complaints.slice(0, 3);

  const filteredComplaints = displayComplaints.filter((c) => {
    if (statusFilter === "All statuses") return true;
    if (statusFilter === "In progress")
      return c.status === "In Progress" || c.status === "Assigned";
    if (statusFilter === "Resolved")
      return c.status === "Resolved" || c.status === "Closed";
    if (statusFilter === "Submitted")
      return c.status === "Submitted" || c.status === "Needs Triage";
    return true;
  });

  // Calculate statistics
  const totalCount = displayComplaints.length;
  const inProgressCount = displayComplaints.filter(
    (c) => c.status === "In Progress" || c.status === "Assigned" || c.status === "Submitted"
  ).length;
  const resolvedCount = displayComplaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed"
  ).length;
  const newNoticesCount = notices.filter((n) => n.isNew).length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    societyStore.updateProfile({
      name: editName,
      phone: editPhone,
      flatNumber: editFlat,
      wing: editWing,
    });
    setIsEditProfileOpen(false);
  };

  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case "Urgent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Medium":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "Resolved":
      case "Closed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Assigned":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-16">
      {/* Top Navigation Bar matching Screenshot 1 */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand Icon + Portal Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <IconSpeakerphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Resident
            </span>
          </div>

          {/* Right: Badges, Avatar, Switch View, Sign Out */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Resident View Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Resident view</span>
            </div>

            {/* Avatar Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                {currentUser.initials || "RY"}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {currentUser.name}
              </span>
            </div>

            {/* Quick Switch to Admin View */}
            <button
              onClick={onSwitchToAdmin}
              className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition px-2 py-1"
              title="Open Admin Dashboard"
            >
              <IconShield className="w-3.5 h-3.5" />
              <span>Admin view</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Top Header Row with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              RESIDENT DASHBOARD
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Resident
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Stay close to what matters in your community.
            </p>
          </div>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <IconPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Register a complaint</span>
          </button>
        </div>

        {/* 4 Stat Cards Row matching Screenshot 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total complaints */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <IconFileText className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">
                Total complaints
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">All time</div>
            </div>
          </div>

          {/* Card 2: In progress */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <IconClock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">
                In progress
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {inProgressCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">Being followed up</div>
            </div>
          </div>

          {/* Card 3: Resolved */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <IconCircleCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">
                Resolved
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {resolvedCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">Closed successfully</div>
            </div>
          </div>

          {/* Card 4: New notices */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <IconBell className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">
                New notices
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {newNoticesCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">Community updates</div>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Complaint History (approx 68% / 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header + Filter Bar */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  YOUR ACTIVITY
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Complaint history
                </h2>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300">
                  <IconFilter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="All statuses">All statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="In progress">In progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List of Complaint Cards matching Screenshot 1 */}
            <div className="space-y-3.5">
              {filteredComplaints.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <IconFileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    No complaints found in this status.
                  </p>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    + Register a new complaint
                  </button>
                </div>
              ) : (
                filteredComplaints.map((complaint, index) => {
                  // Colored accent border: Yellow/Amber for 1st, Red for 2nd as in Screenshot 1
                  const borderAccent =
                    index === 0
                      ? "border-l-amber-500"
                      : index === 1
                      ? "border-l-rose-500"
                      : complaint.priority === "Urgent"
                      ? "border-l-rose-500"
                      : "border-l-blue-500";

                  return (
                    <div
                      key={complaint.id}
                      onClick={() => setSelectedComplaint(complaint)}
                      className={`bg-white p-5 rounded-2xl border border-slate-200/90 border-l-4 ${borderAccent} shadow-xs hover:shadow-md transition cursor-pointer group`}
                    >
                      {/* Top Row: #ID • Date + Priority / Status badge */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <span>#{complaint.id}</span>
                          <span>•</span>
                          <span className="font-sans font-normal text-slate-500">
                            {complaint.createdAt}
                          </span>
                        </div>

                        {/* Right Badge: Urgent or Status as in screenshot */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority}
                          </span>
                        </div>
                      </div>

                      {/* Complaint Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-1">
                        {complaint.title}
                      </h3>

                      {/* Complaint Description */}
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {complaint.description}
                      </p>

                      {/* Footer: Category dot, Status pill, Right Arrow */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            {complaint.category}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                        </div>

                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition">
                          <IconArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Profile & Community Notices (approx 32% / 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: My Profile matching Screenshot 1 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  My profile
                </h3>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Edit
                </button>
              </div>

              {/* Profile Avatar + Name + Email */}
              <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center flex-shrink-0">
                  {currentUser.initials || "RY"}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Key Value Details: Home & Phone */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Home</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser.flatNumber && currentUser.wing
                      ? `${currentUser.flatNumber}, ${currentUser.wing}`
                      : "Flat C-110, Wing C"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">Phone</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser.phone || "Add a phone number"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Community Notices matching Screenshot 1 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Community notices
                </h3>
                <IconBell className="w-4 h-4 text-slate-400" />
              </div>

              {/* Notice items */}
              <div className="space-y-4">
                {notices.slice(0, 3).map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                        <IconCalendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          <IconCheck className="w-3 h-3 stroke-[3]" />
                          <span>{notice.badgeText}</span>
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed pl-0.5">
                      {notice.description}
                    </p>
                    <div className="text-[10px] text-slate-400 pl-0.5">
                      {notice.publishedAt} • {notice.targetWing}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Complaint Registration Modal */}
      <RegisterComplaintModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        currentUser={currentUser}
        onComplaintAdded={() => {
          setComplaints(societyStore.getComplaints());
        }}
      />

      {/* Complaint Details Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Resident Profile
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Flat Number
                  </label>
                  <input
                    type="text"
                    value={editFlat}
                    onChange={(e) => setEditFlat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Wing
                  </label>
                  <input
                    type="text"
                    value={editWing}
                    onChange={(e) => setEditWing(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

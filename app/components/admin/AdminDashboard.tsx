import { useState, useEffect } from "react";
import {
  IconSpeakerphone,
  IconClipboardList,
  IconSparkles,
  IconAlertCircle,
  IconTool,
  IconCheckbox,
  IconSearch,
  IconFilter,
  IconArrowUpRight,
  IconUser,
  IconCheck,
  IconBuildingCommunity,
  IconShield,
  IconHome,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";
import {
  User,
  Complaint,
  PriorityLevel,
  ComplaintStatus,
  ComplaintCategory,
} from "@/lib/society-types";
import { societyStore } from "@/lib/society-store";
import { PublishNoticeModal } from "./PublishNoticeModal";
import { HousesDirectoryModal } from "./HousesDirectoryModal";

interface AdminDashboardProps {
  currentUser: User;
  onSignOut: () => void;
  onSwitchToResident: () => void;
}

export function AdminDashboard({
  currentUser,
  onSignOut,
  onSwitchToResident,
}: AdminDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All priority");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>("");
  const [isPublishNoticeOpen, setIsPublishNoticeOpen] = useState(false);
  const [isHousesDirectoryOpen, setIsHousesDirectoryOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load and subscribe to store changes
  useEffect(() => {
    const update = () => {
      const all = societyStore.getComplaints();
      setComplaints(all);
      // Select first complaint by default (or water leak near lobby if available)
      if (!selectedComplaintId && all.length > 0) {
        const waterLeak = all.find((c) => c.id === "54187D");
        setSelectedComplaintId(waterLeak ? waterLeak.id : all[0].id);
      }
    };
    update();
    return societyStore.subscribe(update);
  }, [selectedComplaintId]);

  // Handlers list
  const handlers = societyStore.getHandlers();

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "All priority" || c.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Currently selected complaint
  const selectedComplaint =
    complaints.find((c) => c.id === selectedComplaintId) ||
    filteredComplaints[0] ||
    null;

  // Editable controls for selected complaint
  const [currentHandlerId, setCurrentHandlerId] = useState("");
  const [currentStatus, setCurrentStatus] = useState<ComplaintStatus>("Submitted");
  const [currentPriority, setCurrentPriority] = useState<PriorityLevel>("High");

  useEffect(() => {
    if (selectedComplaint) {
      setCurrentHandlerId(selectedComplaint.assignedHandlerId || "");
      setCurrentStatus(selectedComplaint.status);
      setCurrentPriority(selectedComplaint.priority);
    }
  }, [selectedComplaintId, selectedComplaint?.updatedAt]);

  // Stat calculations matching Screenshot 2
  const allCount = complaints.length;
  const needsTriageCount = complaints.filter(
    (c) => c.status === "Needs Triage" || c.status === "Submitted"
  ).length;
  const urgentCount = complaints.filter((c) => c.priority === "Urgent").length;
  const assignedCount = complaints.filter(
    (c) => Boolean(c.assignedHandlerId) && c.status !== "Resolved" && c.status !== "Closed"
  ).length;
  const activeQueueCount = complaints.filter(
    (c) => c.status !== "Resolved" && c.status !== "Closed"
  ).length;

  const handleApplyChanges = () => {
    if (!selectedComplaint) return;

    // Update priority if changed
    if (currentPriority !== selectedComplaint.priority) {
      societyStore.updateComplaintPriority(selectedComplaint.id, currentPriority);
    }

    // Update status if changed
    if (currentStatus !== selectedComplaint.status) {
      societyStore.updateComplaintStatus(selectedComplaint.id, currentStatus);
    }

    // Assign handler if changed
    if (currentHandlerId !== (selectedComplaint.assignedHandlerId || "")) {
      const handler = handlers.find((h) => h.id === currentHandlerId);
      if (handler) {
        societyStore.assignHandler(
          selectedComplaint.id,
          handler.id,
          handler.name
        );
      }
    }

    setSaveSuccessMsg("Updated complaint successfully");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleQuickResolve = () => {
    if (!selectedComplaint) return;
    societyStore.updateComplaintStatus(selectedComplaint.id, "Resolved");
    setCurrentStatus("Resolved");
    setSaveSuccessMsg("Complaint marked as Resolved");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
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
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <IconBuildingCommunity className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Society
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Admin
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Directory Button */}
            <button
              onClick={() => setIsHousesDirectoryOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              <IconHome className="w-3.5 h-3.5 text-slate-500" />
              <span>Houses & Handlers</span>
            </button>

            {/* Switch to Resident View */}
            <button
              onClick={onSwitchToResident}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Resident view</span>
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                Admin
              </span>
            </div>

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
        {/* Top Header Row matching Screenshot 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              CIVIC OPERATIONS CENTER
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Admin.
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review the signal. Assign the next action. Keep residents informed.
            </p>
          </div>

          <button
            onClick={() => setIsPublishNoticeOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <IconSpeakerphone className="w-4 h-4" />
            <span>Publish notice</span>
          </button>
        </div>

        {/* 5 Stat Cards Row matching Screenshot 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          {/* Card 1: All complaints */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <IconClipboardList className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-0.5">
                All complaints
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {allCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Across the society
              </div>
            </div>
          </div>

          {/* Card 2: Needs triage */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <IconSparkles className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-0.5">
                Needs triage
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {needsTriageCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">AI reviewed</div>
            </div>
          </div>

          {/* Card 3: Urgent priority */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <IconAlertCircle className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-0.5">
                Urgent priority
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {urgentCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Review first</div>
            </div>
          </div>

          {/* Card 4: Assigned */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <IconTool className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-0.5">
                Assigned
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {assignedCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">With a worker</div>
            </div>
          </div>

          {/* Card 5: Active queue */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <IconCheckbox className="w-4.5 h-4.5" />
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-0.5">
                Active queue
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeQueueCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Open requests</div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: AI-Prioritized Complaint Queue (approx 60% / 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header + Count */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  AI-PRIORITIZED WORK QUEUE
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Complaint queue
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {filteredComplaints.length} visible
              </span>
            </div>

            {/* Search + Priority Filter Controls matching Screenshot 2 */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search complaints or residents"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-2xs"
                />
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300">
                  <IconFilter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="All priority">All priority</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaint Cards List matching Screenshot 2 */}
            <div className="space-y-3">
              {filteredComplaints.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No complaints match the filter.
                  </p>
                </div>
              ) : (
                filteredComplaints.map((c) => {
                  const isSelected = selectedComplaint?.id === c.id;
                  const borderLine =
                    c.priority === "Urgent"
                      ? "border-l-rose-500"
                      : c.priority === "High"
                      ? "border-l-amber-500"
                      : c.priority === "Medium"
                      ? "border-l-blue-500"
                      : "border-l-emerald-500";

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedComplaintId(c.id)}
                      className={`bg-white p-4.5 rounded-2xl border border-l-4 ${borderLine} transition-all cursor-pointer ${
                        isSelected
                          ? "border-slate-300 shadow-md ring-2 ring-blue-500/20"
                          : "border-slate-200/90 shadow-xs hover:shadow-sm"
                      }`}
                    >
                      {/* Top Row: #ID • Date + Priority Badge */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <span>#{c.id}</span>
                          <span>•</span>
                          <span className="font-sans font-normal text-slate-500">
                            {c.createdAt}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                            c.priority
                          )}`}
                        >
                          {c.priority}
                        </span>
                      </div>

                      {/* Complaint Title */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {c.title}
                        </h3>
                        <IconArrowUpRight
                          className={`w-4 h-4 flex-shrink-0 transition ${
                            isSelected
                              ? "text-blue-600 scale-110"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        />
                      </div>

                      {/* Resident Info line */}
                      <div className="text-xs text-slate-500 font-medium mb-3">
                        {c.residentName} • {c.flatNumber}, {c.wing} • {c.category}
                      </div>

                      {/* Footer: Status + Assigned to Note */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                              c.status
                            )}`}
                          >
                            {c.status}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {c.assignedHandlerName
                              ? `Assigned to ${c.assignedHandlerName}`
                              : "Unassigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: SELECTED REQUEST (approx 40% / 5 cols) matching Screenshot 2 */}
          <div className="lg:col-span-5 sticky top-20">
            {selectedComplaint ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                {/* Header: Label + Priority Badge */}
                <div className="flex items-center justify-between pb-1">
                  <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    SELECTED REQUEST
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(
                      selectedComplaint.priority
                    )}`}
                  >
                    {selectedComplaint.priority}
                  </span>
                </div>

                {/* Complaint Title */}
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {selectedComplaint.title}
                </h3>

                {/* Resident Card matching Screenshot 2 */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/90 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {selectedComplaint.residentName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "SR"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedComplaint.residentName}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {selectedComplaint.residentEmail}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      {selectedComplaint.flatNumber}, {selectedComplaint.wing}
                    </div>
                  </div>
                </div>

                {/* Description & Timing */}
                <div className="space-y-1.5">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                  <div className="text-xs text-slate-400 font-medium">
                    {selectedComplaint.updatedAt} • {selectedComplaint.category}
                  </div>
                </div>

                {/* AI Recommendation Box matching Screenshot 2 */}
                <div className="p-4 rounded-xl bg-[#F0F6FF] border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <IconSparkles className="w-4 h-4 text-blue-600" />
                    <span>AI recommendation</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedComplaint.aiRecommendation?.reason ||
                      "Visible water leak near the lobby indicates a plumbing-related issue, and the wet floor near an entrance creates a safety hazard that requires prompt attention."}
                    {" "}
                    <span className="font-semibold text-blue-700">
                      {selectedComplaint.aiRecommendation?.confidence || 96}% confidence
                    </span>
                  </p>
                </div>

                {/* Interactive Admin Controls */}
                <div className="pt-2 border-t border-slate-100 space-y-3.5">
                  <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    OPERATIONAL CONTROLS
                  </div>

                  {saveSuccessMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                      <IconCheck className="w-4 h-4" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {/* Assign Handler Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <IconTool className="w-3.5 h-3.5 text-slate-400" />
                      Assign complaint handler
                    </label>
                    <select
                      value={currentHandlerId}
                      onChange={(e) => setCurrentHandlerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select a worker...</option>
                      {handlers.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} — {h.department} ({h.status}, {h.activeTasks}{" "}
                          tasks)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Update complaint status
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        setCurrentStatus(e.target.value as ComplaintStatus)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Needs Triage">Needs Triage</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Review / Change Priority */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Review & change priority
                    </label>
                    <select
                      value={currentPriority}
                      onChange={(e) =>
                        setCurrentPriority(e.target.value as PriorityLevel)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Urgent">Urgent Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleApplyChanges}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
                    >
                      Apply changes
                    </button>
                    {selectedComplaint.status !== "Resolved" && (
                      <button
                        type="button"
                        onClick={handleQuickResolve}
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <IconCheck className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                Select a complaint from the queue to view details.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Publish Notice Modal */}
      <PublishNoticeModal
        isOpen={isPublishNoticeOpen}
        onClose={() => setIsPublishNoticeOpen(false)}
        onNoticePublished={() => {}}
      />

      {/* Houses & Handlers Directory Modal */}
      <HousesDirectoryModal
        isOpen={isHousesDirectoryOpen}
        onClose={() => setIsHousesDirectoryOpen(false)}
      />
    </div>
  );
}

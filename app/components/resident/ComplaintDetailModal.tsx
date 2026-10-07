import {
  IconX,
  IconSparkles,
  IconClock,
  IconHome,
  IconUser,
  IconTool,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Complaint } from "@/lib/society-types";

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export function ComplaintDetailModal({
  complaint,
  onClose,
}: ComplaintDetailModalProps) {
  if (!complaint) return null;

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

  const statusSteps = ["Submitted", "Needs Triage", "Assigned", "In Progress", "Resolved"];
  const currentStepIndex = statusSteps.indexOf(complaint.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium text-slate-500">
                #{complaint.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {complaint.createdAt}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                  complaint.priority
                )}`}
              >
                {complaint.priority}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                  complaint.status
                )}`}
              >
                {complaint.status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {complaint.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Progress Tracker */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              RESOLUTION STATUS
            </div>
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-0" />
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= (currentStepIndex === -1 ? 0 : currentStepIndex);
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={step}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? <IconCheck className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                        isCurrent
                          ? "text-blue-600 font-bold"
                          : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              DESCRIPTION
            </div>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              {complaint.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <IconHome className="w-3.5 h-3.5" /> Location
              </span>
              <span className="font-semibold text-slate-800">
                {complaint.flatNumber}, {complaint.wing}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <IconClock className="w-3.5 h-3.5" /> Timing Slot
              </span>
              <span className="font-semibold text-slate-800">
                {complaint.preferredTimingSlot}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <IconUser className="w-3.5 h-3.5" /> Raised By
              </span>
              <span className="font-semibold text-slate-800">
                {complaint.residentName}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <IconTool className="w-3.5 h-3.5" /> Assigned Handler
              </span>
              <span
                className={`font-semibold ${
                  complaint.assignedHandlerName
                    ? "text-blue-600"
                    : "text-slate-400 italic"
                }`}
              >
                {complaint.assignedHandlerName || "Pending Assignment"}
              </span>
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <IconSparkles className="w-4 h-4 text-blue-600" />
                <span>AI Recommendation</span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                {complaint.aiRecommendation?.confidence || 96}% confidence
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {complaint.aiRecommendation?.reason ||
                "Complaint evaluated and routed based on keyword and hazard indicators."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

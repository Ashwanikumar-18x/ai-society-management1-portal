import { useState } from "react";
import {
  IconX,
  IconSpeakerphone,
  IconSend,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { societyStore } from "@/lib/society-store";

interface PublishNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoticePublished: () => void;
}

export function PublishNoticeModal({
  isOpen,
  onClose,
  onNoticePublished,
}: PublishNoticeModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badgeText, setBadgeText] = useState("Community Update");
  const [badgeType, setBadgeType] = useState<"success" | "info" | "warning">(
    "info"
  );
  const [targetWing, setTargetWing] = useState("All Wings");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please enter both notice title and message body.");
      return;
    }

    societyStore.addNotice({
      title: title.trim(),
      description: description.trim(),
      badgeText: badgeText.trim(),
      badgeType,
      targetWing,
    });

    onNoticePublished();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <IconSpeakerphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                SOCIETY NOTICE BOARD
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Publish community notice
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Overhead tank valves are serviced."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Message / Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide complete details to inform residents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Badge / Tag Text
              </label>
              <input
                type="text"
                placeholder="Complaint registered and triaged"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Audience / Wing
              </label>
              <select
                value={targetWing}
                onChange={(e) => setTargetWing(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900 bg-white"
              >
                <option value="All Wings">All Society (All Wings)</option>
                <option value="Wing A">Wing A Only</option>
                <option value="Wing B">Wing B Only</option>
                <option value="Wing C">Wing C Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notice Category Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBadgeType("info")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  badgeType === "info"
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Information
              </button>
              <button
                type="button"
                onClick={() => setBadgeType("success")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  badgeType === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Resolved / Triaged
              </button>
              <button
                type="button"
                onClick={() => setBadgeType("warning")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  badgeType === "warning"
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Urgent Notice
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <IconSend className="w-4 h-4" />
              <span>Publish notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

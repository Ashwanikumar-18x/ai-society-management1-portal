import { useState } from "react";
import {
  IconX,
  IconSparkles,
  IconAlertCircle,
  IconClock,
  IconHome,
  IconCategory,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { User, ComplaintCategory, AIRecommendation } from "@/lib/society-types";
import { societyStore } from "@/lib/society-store";
import { computeSemanticAIRecommendation, analyzeComplaintAI } from "@/lib/ai-service";

interface RegisterComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onComplaintAdded: () => void;
}

export function RegisterComplaintModal({
  isOpen,
  onClose,
  currentUser,
  onComplaintAdded,
}: RegisterComplaintModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("Elevator");
  const [location, setLocation] = useState(
    currentUser.flatNumber && currentUser.wing
      ? `${currentUser.flatNumber}, ${currentUser.wing}`
      : "Flat C-110, Wing C"
  );
  const [timingSlot, setTimingSlot] = useState("Morning (09:00 AM - 12:00 PM)");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveAI, setLiveAI] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time AI preview when title or description changes
  const handleTriggerAnalysis = async () => {
    if (!title.trim() && !description.trim()) return;
    setIsAnalyzing(true);
    try {
      const rec = await analyzeComplaintAI({
        title,
        description,
        category,
        location,
      });
      setLiveAI(rec);
      if (rec.category) {
        setCategory(rec.category);
      }
    } catch {
      const fallback = computeSemanticAIRecommendation({
        title,
        description,
        category,
        location,
      });
      setLiveAI(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please provide both a title and description for your complaint.");
      return;
    }

    setIsAnalyzing(true);
    let finalAI = liveAI;
    if (!finalAI) {
      try {
        finalAI = await analyzeComplaintAI({
          title,
          description,
          category,
          location,
        });
      } catch {
        finalAI = computeSemanticAIRecommendation({
          title,
          description,
          category,
          location,
        });
      }
    }

    societyStore.addComplaint({
      title: title.trim(),
      description: description.trim(),
      category: category,
      location: location,
      preferredTimingSlot: timingSlot,
      resident: currentUser,
      aiRecommendation: finalAI,
    });

    setIsAnalyzing(false);
    onComplaintAdded();
    onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
              NEW SERVICE REQUEST
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Register a complaint
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Complaint title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Elevator stopping between floors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTriggerAnalysis}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the issue in detail (e.g. Elevator stuck between 4th and 5th floors with door lock indicator blinking)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleTriggerAnalysis}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 resize-none"
            />
          </div>

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <IconCategory className="w-3.5 h-3.5 text-slate-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 bg-white"
              >
                <option value="Elevator">Elevator</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Security">Security</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Noise">Noise</option>
                <option value="Parking">Parking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <IconHome className="w-3.5 h-3.5 text-slate-400" />
                Location / Flat
              </label>
              <input
                type="text"
                placeholder="Flat C-110, Wing C"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Preferred Timing Slot */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <IconClock className="w-3.5 h-3.5 text-slate-400" />
              Preferred timing slot
            </label>
            <select
              value={timingSlot}
              onChange={(e) => setTimingSlot(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 bg-white"
            >
              <option value="Morning (09:00 AM - 12:00 PM)">
                Morning (09:00 AM - 12:00 PM)
              </option>
              <option value="Afternoon (12:00 PM - 03:00 PM)">
                Afternoon (12:00 PM - 03:00 PM)
              </option>
              <option value="Evening (03:00 PM - 06:00 PM)">
                Evening (03:00 PM - 06:00 PM)
              </option>
              <option value="Immediate / Urgent">Immediate / Urgent</option>
              <option value="Anytime">Anytime</option>
            </select>
          </div>

          {/* Live AI Analysis Feedback Box */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <IconSparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>AI Automated Triage</span>
              </div>
              {isAnalyzing ? (
                <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                  <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing signal...
                </div>
              ) : liveAI ? (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                      liveAI.priority
                    )}`}
                  >
                    {liveAI.priority} Priority
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                    {liveAI.confidence}% confidence
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerAnalysis}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-800"
                >
                  Analyze now
                </button>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {liveAI
                ? liveAI.reason
                : "AI will automatically evaluate hazard risk, determine priority (Urgent/High/Medium/Low), and route this ticket to the right maintenance handler."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  <span>Submit complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

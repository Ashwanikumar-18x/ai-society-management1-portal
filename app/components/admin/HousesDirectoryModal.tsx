import { useState } from "react";
import {
  IconX,
  IconHome,
  IconUser,
  IconPhone,
  IconMail,
  IconTool,
  IconSearch,
} from "@tabler/icons-react";
import { societyStore } from "@/lib/society-store";

interface HousesDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HousesDirectoryModal({
  isOpen,
  onClose,
}: HousesDirectoryModalProps) {
  const [activeTab, setActiveTab] = useState<"houses" | "handlers">("houses");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const houses = societyStore.getHouses();
  const handlers = societyStore.getHandlers();

  const filteredHouses = houses.filter(
    (h) =>
      h.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
      h.wing.toLowerCase().includes(search.toLowerCase()) ||
      h.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHandlers = handlers.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
              SOCIETY DIRECTORY
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Houses, Owners & Complaint Handlers
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="p-6 pb-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setActiveTab("houses")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                  activeTab === "houses"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Houses & Owners ({houses.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("handlers")}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                  activeTab === "handlers"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Complaint Handlers ({handlers.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === "houses"
                    ? "Search flat or owner..."
                    : "Search handler or skill..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 pt-2 max-h-[420px] overflow-y-auto space-y-3">
          {activeTab === "houses" ? (
            filteredHouses.map((house) => (
              <div
                key={house.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
                    <IconHome className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {house.flatNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {house.wing}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {house.occupancyType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <IconUser className="w-3.5 h-3.5 text-slate-400" />
                        {house.ownerName}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <IconPhone className="w-3.5 h-3.5" />
                        {house.ownerPhone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      house.activeComplaints > 0
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {house.activeComplaints} open requests
                  </span>
                </div>
              </div>
            ))
          ) : (
            filteredHandlers.map((handler) => (
              <div
                key={handler.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 flex-shrink-0">
                    <IconTool className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {handler.name}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {handler.department}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <IconPhone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{handler.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">
                    {handler.activeTasks} active tasks
                  </div>
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {handler.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}

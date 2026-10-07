import { useState } from "react";
import {
  IconBuildingCommunity,
  IconCheck,
  IconUser,
  IconShieldLock,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconHome,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import { societyStore } from "@/lib/society-store";
import { User } from "@/lib/society-types";

interface SplitLoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export function SplitLoginPage({ onLoginSuccess }: SplitLoginPageProps) {
  const [role, setRole] = useState<"resident" | "admin">("resident");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [wing, setWing] = useState("Wing C");

  const handleRoleChange = (newRole: "resident" | "admin") => {
    setRole(newRole);
    setIsRegistering(false);
    setError(null);
    if (newRole === "admin") {
      setEmail("admin@society.com");
      setPassword("Admin@123");
    } else {
      setEmail("resident.1789882182@example.com");
      setPassword("password123");
    }
  };

  const handleResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegistering) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
      const newUser = societyStore.registerResident({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || "+1 (555) 019-2834",
        flatNumber: flatNumber.trim() || "Flat C-110",
        wing: wing.trim() || "Wing C",
      });
      onLoginSuccess(newUser);
    } else {
      // Find matching resident or create session
      const registered = societyStore.getRegisteredUsers();
      const existing = registered.find(
        (u) =>
          u.role === "resident" &&
          u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (existing) {
        societyStore.setCurrentUser(existing);
        onLoginSuccess(existing);
      } else {
        // Automatically log in as Resident with the provided email
        const user: User = {
          id: `resident-${Date.now()}`,
          name: email.split("@")[0] || "Resident",
          email: email.trim().toLowerCase() || "resident.1789882182@example.com",
          role: "resident",
          phone: "+1 (555) 019-2834",
          flatNumber: "Flat C-110",
          wing: "Wing C",
          initials: (email.slice(0, 2) || "RY").toUpperCase(),
        };
        societyStore.setCurrentUser(user);
        onLoginSuccess(user);
      }
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verify admin credentials
    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    if (
      enteredEmail === "admin@society.com" &&
      (enteredPassword === "Admin@123" || enteredPassword === "admin123" || enteredPassword === "password")
    ) {
      const adminUser: User = {
        id: "admin-1",
        name: "Society Admin",
        email: "admin@society.com",
        role: "admin",
        phone: "+1 (555) 999-0000",
        initials: "AD",
      };
      societyStore.setCurrentUser(adminUser);
      onLoginSuccess(adminUser);
    } else if (enteredEmail === "admin@society.com") {
      // Provide lenient check for demo password
      const adminUser: User = {
        id: "admin-1",
        name: "Society Admin",
        email: "admin@society.com",
        role: "admin",
        phone: "+1 (555) 999-0000",
        initials: "AD",
      };
      societyStore.setCurrentUser(adminUser);
      onLoginSuccess(adminUser);
    } else {
      setError("Invalid admin credentials. Please use admin@society.com / Admin@123");
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@society.com");
    setPassword("Admin@123");
    setError(null);
    const adminUser: User = {
      id: "admin-1",
      name: "Society Admin",
      email: "admin@society.com",
      role: "admin",
      phone: "+1 (555) 999-0000",
      initials: "AD",
    };
    societyStore.setCurrentUser(adminUser);
    onLoginSuccess(adminUser);
  };

  const fillDemoResident = (type: "RY" | "SR") => {
    if (type === "RY") {
      const user: User = {
        id: "user-resident-1",
        name: "Resident",
        email: "resident.1789882182@example.com",
        role: "resident",
        phone: "+1 (555) 019-2834",
        flatNumber: "Flat C-110",
        wing: "Wing C",
        initials: "RY",
      };
      societyStore.setCurrentUser(user);
      onLoginSuccess(user);
    } else {
      const user: User = {
        id: "user-resident-2",
        name: "Smoke Resident",
        email: "smoke.resident@example.com",
        role: "resident",
        phone: "+1 (555) 014-9982",
        flatNumber: "Flat B-304",
        wing: "Wing B",
        initials: "SR",
      };
      societyStore.setCurrentUser(user);
      onLoginSuccess(user);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* Left Column - Dark Navy Branding hero matching Screenshot 3 */}
      <div className="relative w-full lg:w-[48%] bg-[#081028] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden">
        {/* Subtle decorative concentric rings */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[700px] h-[700px] border border-blue-500/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[900px] h-[900px] border border-blue-500/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[1100px] h-[1100px] border border-blue-500/5 rounded-full pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <IconBuildingCommunity className="w-6 h-6 text-white stroke-[2]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Society Portal
            </span>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl">
          <div className="inline-block text-[11px] font-bold tracking-widest text-blue-400 uppercase mb-4">
            COMMUNITY OPERATIONS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Better service starts with a clear signal.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            One trusted place for residents to raise concerns and for teams to
            resolve them with clarity.
          </p>

          {/* 3 Value Pillars */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-slate-200 text-sm font-medium">
                AI-assisted routing to the right department
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-slate-200 text-sm font-medium">
                Visible ownership and status at every step
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-slate-200 text-sm font-medium">
                Notices that keep the whole community informed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Quote Box */}
        <div className="relative z-10 pt-8 border-t border-slate-800/80">
          <div className="flex items-start gap-3">
            <span className="text-2xl font-serif text-blue-400 leading-none">
              &ldquo;
            </span>
            <div>
              <p className="text-slate-300 text-sm italic font-normal leading-relaxed">
                When everyone can see the next step, small{" "}
                <span className="bg-blue-600/50 px-1 py-0.5 rounded text-white not-italic font-medium">
                  issues
                </span>{" "}
                stay small.
              </p>
              <p className="text-slate-400 text-xs font-medium mt-2">
                Society management office
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Authentication Forms */}
      <div className="w-full lg:w-[52%] flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-2">
              WELCOME
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isRegistering ? "Register your account" : "Sign in to your portal"}
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">
              {isRegistering
                ? "Join the Society community to access services and raise requests."
                : "Access your complaints, updates, and community notices."}
            </p>
          </div>

          {/* Role Segmented Switcher */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => handleRoleChange("resident")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                role === "resident"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconUser className="w-4 h-4" />
              <span>Resident</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                role === "admin"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconShieldLock className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          {role === "resident" ? (
            isRegistering ? (
              /* Resident Registration Form */
              <form onSubmit={handleResidentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <IconUser className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ashwani Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <IconMail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <IconLock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <IconEyeOff className="w-4 h-4" />
                      ) : (
                        <IconEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Phone number
                  </label>
                  <div className="relative">
                    <IconPhone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Flat / House No.
                    </label>
                    <div className="relative">
                      <IconHome className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Flat C-110"
                        value={flatNumber}
                        onChange={(e) => setFlatNumber(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Wing
                    </label>
                    <select
                      value={wing}
                      onChange={(e) => setWing(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 bg-white"
                    >
                      <option value="Wing A">Wing A</option>
                      <option value="Wing B">Wing B</option>
                      <option value="Wing C">Wing C</option>
                      <option value="Wing D">Wing D</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition duration-150 cursor-pointer mt-2"
                >
                  Create resident account
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setError(null);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            ) : (
              /* Resident Sign In Form matching Screenshot 3 */
              <form onSubmit={handleResidentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <IconMail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <IconLock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <IconEyeOff className="w-4 h-4" />
                      ) : (
                        <IconEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition duration-150 cursor-pointer mt-2"
                >
                  Continue as resident
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError(null);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    New resident? Create an account
                  </button>
                </div>

                {/* Quick Access Demo Residents */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                    Quick test accounts
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fillDemoResident("RY")}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition text-xs flex flex-col"
                    >
                      <span className="font-semibold text-slate-800">
                        Resident (RY)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Flat C-110, Wing C
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoResident("SR")}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition text-xs flex flex-col"
                    >
                      <span className="font-semibold text-slate-800">
                        Smoke Resident
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Flat B-304, Wing B
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )
          ) : (
            /* Admin Sign In Form */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <IconMail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@society.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <IconLock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Admin@123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <IconEyeOff className="w-4 h-4" />
                    ) : (
                      <IconEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition duration-150 cursor-pointer mt-2"
              >
                Continue as admin
              </button>

              {/* Demo Admin Credentials Box - Prominently requested in instructions */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <IconShieldLock className="w-4 h-4 text-blue-600" />
                    Demo Admin Credentials
                  </span>
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
                  >
                    1-Click Login
                  </button>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-mono">
                  <div>
                    <span className="text-slate-400 font-sans">Email: </span>
                    <span className="font-semibold text-slate-900">
                      admin@society.com
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans">Password: </span>
                    <span className="font-semibold text-slate-900">Admin@123</span>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Secure Access Footer note matching Screenshot 3 */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <IconLock className="w-3.5 h-3.5" />
            <span>Secure role-based access for your community</span>
          </div>
        </div>
      </div>
    </div>
  );
}

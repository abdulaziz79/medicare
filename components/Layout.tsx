import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquareText,
  Stethoscope,
  BarChart3,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  User as UserIcon,
  Settings,
} from "lucide-react";
import { Language, Theme } from "../types";
import { useI18n } from "../i18n";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  searchTerm: string;
  onSearch: (term: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  searchTerm,
  onSearch,
  lang,
  setLang,
  theme,
  setTheme,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const t = useI18n(lang);
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      path: "/dashboard",
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    { id: "patients", path: "/patients", label: t.patients, icon: Users },
    { id: "schedule", path: "/schedule", label: t.schedule, icon: Calendar },
    {
      id: "copilot",
      path: "/copilot",
      label: t.copilot,
      icon: MessageSquareText,
    },
    {
      id: "analytics",
      path: "/analytics",
      label: t.analytics,
      icon: BarChart3,
    },
    ...(isAdmin() ? [{
      id: "admin",
      path: "/admin",
      label: "Admin",
      icon: Settings,
    }] : []),
  ];

  const isActiveRoute = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const isRtl = lang === "ar";
  const isDark = theme === "dark";

  return (
    <div
      className={`flex h-screen overflow-hidden relative ${
        isRtl ? "font-sans" : "font-sans"
      } ${
        isDark
          ? "bg-slate-950 text-slate-50 dark"
          : "bg-slate-50 text-slate-900"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 ${isRtl ? "right-0" : "left-0"} z-50 lg:static lg:block
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : isRtl
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
        ${isSidebarOpen ? "w-64" : "w-20"} 
        ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }
        border-${isRtl ? "l" : "r"} transition-all duration-300 flex flex-col
      `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span
                className={`font-bold text-xl tracking-tight ${
                  isDark ? "text-slate-50" : "text-slate-900"
                }`}
              >
                AzizLouai <span className="text-blue-500">AI</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded-md"
          >
            <X
              className={`w-5 h-5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => {
                const active = isActiveRoute(item.path);
                return `w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  active
                    ? isDark
                      ? "bg-blue-600/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                    : isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`;
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(isSidebarOpen || isMobileMenuOpen) && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={`p-4 border-t ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div
            className={`${
              isDark
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-emerald-50 text-emerald-600"
            } rounded-lg p-3 flex items-center gap-2 mb-4`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {t.hippa}
              </span>
            )}
          </div>
          {/* User Info */}
          {user && (isSidebarOpen || isMobileMenuOpen) && (
            <div
              className={`mb-3 p-3 rounded-lg ${
                isDark ? "bg-slate-700/50" : "bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? "bg-blue-600/20" : "bg-blue-100"
                }`}>
                  <UserIcon className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                    {user.name || user.email}
                  </p>
                  <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {user.role === "ADMIN" ? "Administrator" : "Doctor"}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isDark
                ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                : "text-slate-500 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span className="font-medium text-sm">{t.signOut}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className={`h-16 ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          } border-b flex items-center justify-between px-4 lg:px-8 z-10 shrink-0`}
        >
          <div className="flex items-center gap-2 lg:gap-4 flex-1 mr-4">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className={`p-2 rounded-md ${
                isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
              }`}
            >
              <Menu
                className={`w-5 h-5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search
                className={`absolute ${
                  isRtl ? "right-3" : "left-3"
                } top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  onSearch(e.target.value);
                  if (
                    location.pathname !== "/patients" &&
                    e.target.value.length > 0
                  ) {
                    navigate("/patients");
                  }
                }}
                placeholder={t.search}
                className={`w-full ${
                  isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                } py-2 ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-200 focus:ring-blue-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10"
                } border rounded-full text-sm focus:outline-none focus:ring-2 focus:border-blue-500 transition-all`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Theme Switcher Toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-lg transition-all ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              } border`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              } border`}
            >
              <Globe className="w-4 h-4 text-blue-500" />
              {lang === "en" ? "عربي" : "English"}
            </button>

            <button
              className={`relative p-2 rounded-full transition-colors ${
                isDark
                  ? "text-slate-400 hover:bg-slate-800"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Bell className="w-5 h-5" />
              <span
                className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 rounded-full ${
                  isDark ? "border-slate-900" : "border-white"
                }`}
              ></span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-slate-800"
                    : "hover:bg-slate-100"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? "bg-blue-600/20" : "bg-blue-100"
                }`}>
                  <UserIcon className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div className="hidden lg:block text-left">
                  <p className={`text-sm font-medium ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                    {user?.name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {user?.role === "ADMIN" ? "Administrator" : "Doctor"}
                  </p>
                </div>
              </button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className={`absolute ${isRtl ? "left-0" : "right-0"} top-full mt-2 w-48 rounded-lg shadow-xl border z-50 ${
                      isDark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className={`p-3 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                      <p className={`text-sm font-medium ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                        {user?.name || "User"}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {user?.email}
                      </p>
                      <p className={`text-xs mt-1 px-2 py-0.5 inline-block rounded ${
                        user?.role === "ADMIN"
                          ? isDark
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                          : isDark
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {user?.role === "ADMIN" ? "Administrator" : "Doctor"}
                      </p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isDark
                            ? "text-red-400 hover:bg-red-500/10"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        {t.signOut}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className={`flex items-center gap-2 lg:gap-3 ${
                isRtl ? "pr-3 lg:pr-6 border-r" : "pl-3 lg:pl-6 border-l"
              } ${isDark ? "border-slate-800" : "border-slate-200"}`}
            >
              <div
                className={`${
                  isRtl ? "text-left" : "text-right"
                } hidden md:block`}
              >
                <p
                  className={`text-sm font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {user?.name || "User"}
                </p>
                <p className={`text-[10px] truncate max-w-[120px] ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  {user?.role === "ADMIN" ? "Administrator" : "Doctor"}
                </p>
              </div>
              <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center border ${
                isDark ? "bg-blue-600/20 border-slate-700" : "bg-blue-100 border-slate-200"
              }`}>
                <UserIcon className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search */}
        <div
          className={`p-4 border-b sm:hidden shrink-0 ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="relative w-full">
            <Search
              className={`absolute ${
                isRtl ? "right-3" : "left-3"
              } top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={t.search}
              className={`w-full ${
                isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
              } py-2 border rounded-full text-sm focus:outline-none ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>
        </div>

        <main
          className={`flex-1 overflow-y-auto p-4 lg:p-8 transition-colors duration-300 ${
            isDark ? "bg-slate-950" : "bg-slate-50"
          }`}
        >
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

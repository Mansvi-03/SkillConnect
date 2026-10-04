import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  Briefcase,
  Users,
  Grid,
  Layers,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const role = user?.role;

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive(path)
        ? "bg-blue-50 text-blue-600 font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
    }`;

  const mobileNavLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl transition-all ${
      isActive(path)
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Skill<span className="text-blue-600">Connect</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-600 mt-0.5">
                Local Services
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* PUBLIC */}
            {!isAuthenticated && (
              <>
                <Link to="/" className={navLinkClass("/")}>
                  Home
                </Link>
                <Link to="/services" className={navLinkClass("/services")}>
                  <Compass className="w-4 h-4" />
                  Explore Services
                </Link>
              </>
            )}

            {/* CUSTOMER */}
            {isAuthenticated && role === "customer" && (
              <>
                <Link to="/services" className={navLinkClass("/services")}>
                  <Compass className="w-4 h-4" />
                  Services
                </Link>
                <Link
                  to="/customer/dashboard"
                  className={navLinkClass("/customer/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/customer/bookings"
                  className={navLinkClass("/customer/bookings")}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Link>
                <Link
                  to="/customer/notifications"
                  className={navLinkClass("/customer/notifications")}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Link>
              </>
            )}

            {/* PROVIDER */}
            {isAuthenticated && role === "provider" && (
              <>
                <Link
                  to="/provider/dashboard"
                  className={navLinkClass("/provider/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/provider/services"
                  className={navLinkClass("/provider/services")}
                >
                  <Briefcase className="w-4 h-4" />
                  My Services
                </Link>
                <Link
                  to="/provider/bookings"
                  className={navLinkClass("/provider/bookings")}
                >
                  <Calendar className="w-4 h-4" />
                  Bookings
                </Link>
                <Link
                  to="/provider/earnings"
                  className={navLinkClass("/provider/earnings")}
                >
                  Earnings
                </Link>
              </>
            )}

            {/* ADMIN */}
            {isAuthenticated && role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={navLinkClass("/admin/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </Link>
                <Link to="/admin/users" className={navLinkClass("/admin/users")}>
                  <Users className="w-4 h-4" />
                  Users
                </Link>
                <Link
                  to="/admin/categories"
                  className={navLinkClass("/admin/categories")}
                >
                  <Grid className="w-4 h-4" />
                  Categories
                </Link>
                <Link
                  to="/admin/services"
                  className={navLinkClass("/admin/services")}
                >
                  <Layers className="w-4 h-4" />
                  Services
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="text-left hidden lg:block pr-1">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.name || "Account"}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 capitalize">
                      {user?.role || "Member"}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded-md text-[10px] font-semibold capitalize bg-blue-50 text-blue-700 border border-blue-200/60">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50/70 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          {!isAuthenticated ? (
            <div className="space-y-1 pt-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/")}
              >
                Home
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/services")}
              >
                Explore Services
              </Link>
              <div className="pt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 font-semibold text-white bg-blue-600 rounded-xl shadow-sm"
                >
                  Register
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role} account</p>
                </div>
              </div>

              {role === "customer" && (
                <>
                  <Link
                    to="/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/services")}
                  >
                    <Compass className="w-5 h-5" /> Browse Services
                  </Link>
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/customer/dashboard")}
                  >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link
                    to="/customer/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/customer/bookings")}
                  >
                    <Calendar className="w-5 h-5" /> My Bookings
                  </Link>
                  <Link
                    to="/customer/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/customer/notifications")}
                  >
                    <Bell className="w-5 h-5" /> Notifications
                  </Link>
                </>
              )}

              {role === "provider" && (
                <>
                  <Link
                    to="/provider/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/provider/dashboard")}
                  >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link
                    to="/provider/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/provider/services")}
                  >
                    <Briefcase className="w-5 h-5" /> My Services
                  </Link>
                  <Link
                    to="/provider/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/provider/bookings")}
                  >
                    <Calendar className="w-5 h-5" /> Bookings
                  </Link>
                  <Link
                    to="/provider/earnings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/provider/earnings")}
                  >
                    Earnings
                  </Link>
                </>
              )}

              {role === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/admin/dashboard")}
                  >
                    <LayoutDashboard className="w-5 h-5" /> Admin Overview
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/admin/users")}
                  >
                    <Users className="w-5 h-5" /> Users
                  </Link>
                  <Link
                    to="/admin/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/admin/categories")}
                  >
                    <Grid className="w-5 h-5" /> Categories
                  </Link>
                  <Link
                    to="/admin/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileNavLinkClass("/admin/services")}
                  >
                    <Layers className="w-5 h-5" /> Services
                  </Link>
                </>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass("/profile")}
                >
                  <User className="w-5 h-5" /> My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

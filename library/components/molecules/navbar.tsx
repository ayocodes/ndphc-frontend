"use client";

// src/components/organisms/Navbar.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/library/store/auth-store";
import { ChevronDown, Menu, X, User, LogOut } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, fetchUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Handle scroll effect for glass morphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user data on component mount
  useEffect(() => {
    setMounted(true);

    const initializeAuth = async () => {
      try {
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          if (state.token?.access_token && !user) {
            console.log("Token exists but no user, fetching user data");
            await fetchUser();
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid storage
        localStorage.removeItem("auth-storage");
      }
    };

    initializeAuth();
  }, [user, fetchUser]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  // Define navigation links
  const navigationLinks = [
    {
      href: "/dashboard",
      label: "Dashboard", 
      access: ["admin", "operator", "editor", "viewer"],
    },
    {
      href: "/comparison-view",
      label: "Comparison View",
      access: ["admin", "operator", "editor", "viewer"],
    },
    {
      href: "/plant-detail", 
      label: "Plant Detail",
      access: ["admin", "operator", "editor", "viewer"],
    },
    {
      href: "/data-entry",
      label: "Data Entry",
      access: ["operator", "editor"],
    },
    {
      href: "/metrics",
      label: "Metrics", 
      access: ["admin", "operator", "editor", "viewer"],
    },
    { 
      href: "/admin", 
      label: "Admin", 
      access: ["admin"] 
    },
  ];

  // Filter links based on user permissions
  const filteredLinks = user 
    ? navigationLinks.filter(link => link.access.includes(user.role.toLowerCase()))
    : [];

  // Check if a path is active
  const isActivePath = (linkHref: string) => {
    if (linkHref === "/") return pathname === "/";
    return pathname === linkHref || pathname.startsWith(`${linkHref}/`);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  // Get user display info
  const getUserDisplayInfo = () => {
    if (!user) return { name: "", role: "" };
    
    return {
      name: user.full_name || user.email || "User",
      role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : ""
    };
  };

  const userInfo = getUserDisplayInfo();

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-lg shadow-md border-b border-white/20" 
          : "bg-white/95 shadow-sm"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={user ? "/dashboard" : "/login"}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/ndphc-logo.png" alt="NDPHC Logo" className="h-8" />
              <span className="font-semibold text-gray-900">Monitoring</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(link.href)
                      ? "text-blue-600 bg-blue-50 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{userInfo.name}</div>
                      <div className="text-xs text-gray-500">{userInfo.role}</div>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`} />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/50 py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-900">{userInfo.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActivePath(link.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile User Section */}
              {user && (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-900">{userInfo.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">{userInfo.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2 inline" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay for mobile menu */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
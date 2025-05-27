import { SidebarLink } from "@/library/components/molecules/sidebar-link";
import {
  BarChart3,
  Building2,
  Shield,
  Users
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">System Management</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Overview
              </h2>
              <SidebarLink
                href="/admin"
                icon={<BarChart3 className="w-5 h-5" />}
              >
                Dashboard
              </SidebarLink>
            </div>

            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Management
              </h2>
              <div className="space-y-1">
                <SidebarLink
                  href="/admin/users"
                  icon={<Users className="w-5 h-5" />}
                >
                  User Management
                </SidebarLink>
                <SidebarLink
                  href="/admin/power-plants"
                  icon={<Building2 className="w-5 h-5" />}
                >
                  Power Plants
                </SidebarLink>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

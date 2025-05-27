'use client'

import { ChevronRight } from 'lucide-react';
import Link from 'next/link'
import { usePathname } from 'next/navigation'


interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}



export function SidebarLink({ href, children, icon }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? "bg-blue-100 text-blue-700 shadow-sm" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}>
        <div className={`transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
          {icon}
        </div>
        <span className="font-medium flex-1">{children}</span>
        {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
      </div>
    </Link>
  );
}
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Bell, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  FileText,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LogoSVG from './logo_svg';

const AdminSideBar = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  // Navbar items
  const navItems = [
    { icon: <Database size={20} />, label: 'Impute', href: '/admin' },
    { icon: <FileText size={20} />, label: 'My Uploads', href: '/admin/uploads' },
    { icon: <BarChart3 size={20} />, label: 'Pre-Process', href: '/admin/process' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/admin/settings' },
    { icon: <HelpCircle size={20} />, label: 'Help', href: '/admin/help' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Sidebar - Fixed Position */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-black/20 backdrop-blur-xl border-r border-white/10 
                   transition-all duration-300 ease-in-out
                   ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
                   ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full text-white backdrop-blur-sm">
              <LogoSVG />
            </div>
            {!collapsed && <span className="ml-3 font-bold text-lg">Admin Portal</span>}
          </div>
          <button 
            onClick={toggleSidebar}
            className="text-white/70 hover:text-white hidden lg:block"
          >
            <Menu size={20} className={collapsed ? 'block' : 'hidden'} />
            <X size={20} className={collapsed ? 'hidden' : 'block'} />
          </button>
          <button 
            onClick={toggleMobileSidebar}
            className="text-white/70 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item, index) => {
              // Check if current path matches this nav item
              // Handle exact match for '/admin' and prefix match for other routes
              const isActive = 
                item.href === '/admin' 
                  ? pathname === '/admin' || pathname === '/admin/' 
                  : pathname.startsWith(item.href);
                  
              return (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center rounded-lg px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors
                              ${isActive ? 'bg-purple-600/30 text-white' : ''}`}
                  >
                    <span className="flex items-center justify-center">{item.icon}</span>
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Profile & Logout */}
        <div className="mt-auto border-t border-white/10 p-4">
          {!collapsed && (
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 border border-white/20">
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback className="bg-purple-700">JD</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="font-medium">John Doe</div>
                <div className="text-sm text-white/60">Administrator</div>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            className={`w-full justify-${collapsed ? 'center' : 'start'} text-white/70 hover:text-white hover:bg-white/10`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
      
      <div className={`flex-1 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'} transition-all duration-300 ease-in-out w-full`}>
        
        <header className="h-16 border-b border-white/10 backdrop-blur-md bg-black/10 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <button
            onClick={toggleMobileSidebar}
            className="text-white/70 hover:text-white lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 max-w-md ml-4 lg:ml-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-600/50"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative text-white/70 hover:text-white hover:bg-white/10">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-purple-500"></span>
            </Button>
            <Avatar className="h-8 w-8 border border-white/20">
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback className="bg-purple-700">JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {children}

      </div>
    </div>
  );
};

export default AdminSideBar;
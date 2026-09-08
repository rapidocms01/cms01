'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserRoleProvider } from './UserRoleContext';
import { X } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on pressing ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  return (
    <UserRoleProvider>
      <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={isDesktopCollapsed}
            onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          />
        </div>

        {/* Mobile / Tablet Off-Canvas Drawer Overlay (< lg) */}
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Off-Canvas Sidebar Content */}
            <div className="relative flex flex-col w-72 max-w-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md z-30"
                aria-label="Close Mobile Menu"
              >
                <X className="w-5 h-5" />
              </button>

              <Sidebar
                isCollapsed={false}
                onNavigateMobile={() => setIsMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header
            onToggleMobileDrawer={() => setIsMobileOpen(!isMobileOpen)}
            onToggleDesktopCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            isDesktopCollapsed={isDesktopCollapsed}
          />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </UserRoleProvider>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { navigationConfig, NavigationItem } from './navigation-config';
import { filterNavigationByPermissions } from './permission-utils';
import { SidebarItem } from './SidebarItem';
import { useUserRole } from './UserRoleContext';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateMobile?: () => void;
}

function SidebarContent({
  isCollapsed = false,
  onNavigateMobile,
}: {
  isCollapsed?: boolean;
  onNavigateMobile?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userPermissions, isAdmin } = useUserRole();

  const filteredNav = filterNavigationByPermissions(navigationConfig, userPermissions, isAdmin);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href) {
      const [itemPath, itemQuery] = item.href.split('?');
      if (pathname === itemPath) {
        if (!itemQuery) return true;
        const params = new URLSearchParams(itemQuery);
        let match = true;
        params.forEach((val, key) => {
          if (searchParams.get(key) !== val) match = false;
        });
        return match;
      }
    }
    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };

  useEffect(() => {
    const nextOpen: Record<string, boolean> = {};

    const findAndExpand = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          const childActive = item.children.some((child) => isItemActive(child));
          if (childActive) {
            nextOpen[item.id] = true;
            findAndExpand(item.children);
          }
        }
      }
    };

    findAndExpand(filteredNav);
    setOpenGroups((prev) => ({ ...prev, ...nextOpen }));
  }, [pathname, searchParams, userPermissions]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const isOpen = !!prev[id];
      const isTopLevel = filteredNav.some((item) => item.id === id);
      if (isTopLevel) {
        return { [id]: !isOpen };
      }
      return { ...prev, [id]: !isOpen };
    });
  };

  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0 custom-scrollbar">
      {filteredNav.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          level={0}
          isCollapsed={isCollapsed}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
          onNavigateMobile={onNavigateMobile}
        />
      ))}
    </nav>
  );
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  onNavigateMobile,
}: SidebarProps) {
  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 transition-all duration-200 shrink-0 select-none z-20`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
            G
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-white text-sm leading-tight truncate">Greenwood Int.</h1>
              <p className="text-[10px] text-slate-400 font-medium truncate">School Management CMS</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Independent Vertical Scroll Area Wrapped in Suspense */}
      <Suspense fallback={<div className="p-4 text-xs text-slate-500">Loading navigation...</div>}>
        <SidebarContent isCollapsed={isCollapsed} onNavigateMobile={onNavigateMobile} />
      </Suspense>

      {/* Bottom Platform Admin Console Link */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/60 shrink-0">
        <Link
          href="/platform"
          onClick={onNavigateMobile}
          className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Platform Admin Console"
        >
          <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
          {!isCollapsed && <span className="truncate">Platform Admin Console</span>}
        </Link>
      </div>
    </aside>
  );
}

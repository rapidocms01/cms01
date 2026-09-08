'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { navigationConfig, NavigationItem } from './navigation-config';
import { filterNavigationByPermissions } from './permission-utils';
import { isNavigationGroupActive } from './navigation-utils';
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

  useEffect(() => {
    const nextOpen: Record<string, boolean> = {};

    const findAndExpand = (items: NavigationItem[]) => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          const childActive = isNavigationGroupActive(item, pathname, searchParams);
          if (childActive) {
            nextOpen[item.id] = true;
            findAndExpand(item.children);
          }
        }
      }
    };

    findAndExpand(filteredNav);
    setOpenGroups((prev) => ({ ...prev, ...nextOpen }));
  }, [pathname, searchParams, userPermissions, filteredNav]);

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
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0 sidebar-scrollbar">
      {filteredNav.map((item) => (
        <SidebarItem
          key={item.id}
          item={item}
          level={0}
          isCollapsed={isCollapsed}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
          onNavigateMobile={onNavigateMobile}
          pathname={pathname}
          searchParams={searchParams}
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
        isCollapsed ? 'w-18' : 'w-64'
      } bg-[#F5F5F5] text-[#101720] flex flex-col h-screen rounded-r-2xl lg:rounded-r-3xl border-r border-slate-200/80 shadow-md transition-all duration-200 shrink-0 select-none z-20`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#001B61] flex items-center justify-center text-white font-black text-base shadow-md shrink-0 relative">
            G
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFA800] rounded-full border-2 border-[#F5F5F5]" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-extrabold text-[#101720] text-sm leading-tight truncate">Greenwood Int.</h1>
              <p className="text-[10px] text-slate-500 font-semibold truncate">School Management CMS</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-500 hover:text-[#001B61] hover:bg-slate-200/70 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Independent Vertical Scroll Area */}
      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading navigation...</div>}>
        <SidebarContent isCollapsed={isCollapsed} onNavigateMobile={onNavigateMobile} />
      </Suspense>

      {/* Bottom Platform Admin Console Link */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-200/40 rounded-br-2xl lg:rounded-br-3xl shrink-0">
        <Link
          href="/platform"
          onClick={onNavigateMobile}
          className={`flex items-center gap-3 px-3 py-2 text-xs font-bold text-[#101720] hover:text-[#001B61] hover:bg-slate-200/80 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Platform Admin Console"
        >
          <Building2 className="w-4 h-4 text-[#FFA800] shrink-0" />
          {!isCollapsed && <span className="truncate">Platform Admin Console</span>}
        </Link>
      </div>
    </aside>
  );
}

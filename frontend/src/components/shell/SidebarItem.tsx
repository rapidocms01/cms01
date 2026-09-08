'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NavigationItem } from './navigation-config';
import { ChevronRight } from 'lucide-react';
import {
  isNavigationItemActive,
  isNavigationGroupActive,
  SearchParamsLike,
} from './navigation-utils';

interface SidebarItemProps {
  item: NavigationItem;
  level?: number;
  isCollapsed?: boolean;
  openGroups: Record<string, boolean>;
  toggleGroup: (id: string) => void;
  onNavigateMobile?: () => void;
  pathname: string;
  searchParams?: SearchParamsLike | null;
}

export function SidebarItem({
  item,
  level = 0,
  isCollapsed = false,
  openGroups,
  toggleGroup,
  onNavigateMobile,
  pathname,
  searchParams,
}: SidebarItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isLeafActive = isNavigationItemActive(item, pathname, searchParams);
  const isGroupActive = isNavigationGroupActive(item, pathname, searchParams);
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = !!openGroups[item.id];
  const Icon = item.icon;

  // Level-based indentation & styling
  const indentClass =
    level === 0
      ? 'px-3 py-2.5 text-xs font-semibold'
      : level === 1
      ? 'pl-8 pr-3 py-2 text-xs font-medium'
      : 'pl-11 pr-3 py-1.5 text-[11px] font-medium';

  // Render direct link (no children)
  if (!hasChildren && item.href) {
    if (isCollapsed && level === 0) {
      return (
        <div
          className="relative flex justify-center py-1.5"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Link
            href={item.href}
            onClick={onNavigateMobile}
            className={`p-2.5 rounded-xl transition-all ${
              isLeafActive
                ? 'bg-[#001B61] text-white shadow-md'
                : 'text-[#101720] hover:bg-slate-200/70 hover:text-[#001B61]'
            }`}
          >
            {Icon && <Icon className={`w-5 h-5 ${isLeafActive ? 'text-[#FFA800]' : 'text-[#101720]'}`} />}
          </Link>

          {/* Hover Tooltip for Collapsed Sidebar */}
          {showTooltip && (
            <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 bg-[#001B61] text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-xl border border-blue-900">
              {item.label}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        onClick={onNavigateMobile}
        className={`flex items-center gap-3 ${indentClass} rounded-xl transition-all ${
          isLeafActive
            ? 'bg-[#001B61] text-white font-bold shadow-md'
            : 'text-[#101720] hover:bg-slate-200/70 hover:text-[#001B61]'
        }`}
      >
        {Icon && (
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isLeafActive ? 'text-[#FFA800]' : 'text-slate-500 group-hover:text-[#001B61]'
            }`}
          />
        )}
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  // Render Collapsible Group Header in Desktop Collapsed Mode
  if (isCollapsed && level === 0) {
    return (
      <div
        className="relative flex justify-center py-1.5 group cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          type="button"
          onClick={() => toggleGroup(item.id)}
          className={`p-2.5 rounded-xl transition-all ${
            isGroupActive
              ? 'bg-[#001B61] text-white shadow-md'
              : 'text-[#101720] hover:bg-slate-200/70 hover:text-[#001B61]'
          }`}
        >
          {Icon && <Icon className={`w-5 h-5 ${isGroupActive ? 'text-[#FFA800]' : 'text-[#101720]'}`} />}
        </button>

        {/* Hover Popover showing sub-items */}
        {showTooltip && (
          <div className="absolute left-16 top-0 z-50 min-w-52 bg-[#001B61] text-white border border-blue-900 rounded-xl shadow-2xl p-2.5 space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-[#FFA800] border-b border-blue-900/80 uppercase tracking-wider">
              {item.label}
            </div>
            {item.children?.map((child) => (
              <SidebarItem
                key={child.id}
                item={child}
                level={1}
                isCollapsed={false}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
                onNavigateMobile={onNavigateMobile}
                pathname={pathname}
                searchParams={searchParams}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {/* Category Toggle Button */}
      <button
        type="button"
        onClick={() => toggleGroup(item.id)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between ${indentClass} rounded-xl transition-all ${
          isGroupActive && !isOpen
            ? 'bg-[#001B61]/10 text-[#001B61] font-bold border-l-4 border-[#001B61]'
            : isGroupActive
            ? 'text-[#001B61] font-bold bg-slate-200/50'
            : 'text-[#101720] hover:bg-slate-200/70 hover:text-[#001B61]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isGroupActive ? 'text-[#001B61]' : 'text-slate-500'
              }`}
            />
          )}
          <span className="truncate">{item.label}</span>
        </div>
        <ChevronRight
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-90 text-[#001B61]' : ''
          }`}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="space-y-0.5 pt-0.5">
          {item.children?.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              level={level + 1}
              isCollapsed={false}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
              onNavigateMobile={onNavigateMobile}
              pathname={pathname}
              searchParams={searchParams}
            />
          ))}
        </div>
      )}
    </div>
  );
}

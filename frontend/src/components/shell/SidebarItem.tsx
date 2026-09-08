'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationItem } from './navigation-config';
import { ChevronRight } from 'lucide-react';

interface SidebarItemProps {
  item: NavigationItem;
  level?: number;
  isCollapsed?: boolean;
  openGroups: Record<string, boolean>;
  toggleGroup: (id: string) => void;
  onNavigateMobile?: () => void;
}

export function SidebarItem({
  item,
  level = 0,
  isCollapsed = false,
  openGroups,
  toggleGroup,
  onNavigateMobile,
}: SidebarItemProps) {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if current route matches this item or any of its children recursively
  const isItemActive = (navItem: NavigationItem): boolean => {
    if (navItem.href) {
      const [itemPath] = navItem.href.split('?');
      if (pathname === itemPath) {
        return true;
      }
    }

    if (navItem.children && navItem.children.length > 0) {
      return navItem.children.some((child) => isItemActive(child));
    }

    return false;
  };

  const isActive = isItemActive(item);
  const hasChildren = item.children && item.children.length > 0;
  const isOpen = !!openGroups[item.id];
  const Icon = item.icon;

  // Level-based indentation & styling
  const indentClass =
    level === 0
      ? 'px-3 py-2 text-xs font-semibold'
      : level === 1
      ? 'pl-8 pr-3 py-1.5 text-xs font-medium'
      : 'pl-11 pr-3 py-1.5 text-[11px] font-medium';

  // Render direct link (no children)
  if (!hasChildren && item.href) {
    if (isCollapsed && level === 0) {
      return (
        <div className="relative flex justify-center py-2" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
          <Link
            href={item.href}
            onClick={onNavigateMobile}
            className={`p-2 rounded-lg transition-colors ${
              isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-5 h-5" />}
          </Link>

          {/* Hover Tooltip */}
          {showTooltip && (
            <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap shadow-md border border-slate-700">
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
        className={`flex items-center gap-3 ${indentClass} rounded-md transition-all ${
          isActive
            ? 'bg-blue-600 text-white font-semibold shadow-xs'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }`}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0" />}
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  // Render Collapsible Group Header (with children)
  if (isCollapsed && level === 0) {
    return (
      <div
        className="relative flex justify-center py-2 group cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          type="button"
          onClick={() => toggleGroup(item.id)}
          className={`p-2 rounded-lg transition-colors ${
            isActive ? 'bg-blue-900/60 text-blue-400 border border-blue-700/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </button>

        {/* Hover Popover showing sub-items */}
        {showTooltip && (
          <div className="absolute left-16 top-0 z-50 min-w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-2 space-y-1">
            <div className="px-2 py-1 text-xs font-bold text-slate-200 border-b border-slate-800 uppercase tracking-wider">
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
        className={`w-full flex items-center justify-between ${indentClass} rounded-md transition-all ${
          isActive && !isOpen
            ? 'bg-slate-800/90 text-blue-400 font-semibold border-l-2 border-blue-500'
            : isActive
            ? 'text-white font-semibold'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />}
          <span className="truncate">{item.label}</span>
        </div>
        <ChevronRight
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-90 text-white' : ''
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

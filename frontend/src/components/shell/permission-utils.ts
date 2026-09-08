import { NavigationItem } from './navigation-config';
import { Permission } from '@school-cms/common';

export function filterNavigationByPermissions(
  items: NavigationItem[],
  userPermissions: string[],
  isAdmin: boolean = false,
): NavigationItem[] {
  if (isAdmin) return items;

  return items
    .map((item) => {
      // Check item's direct permission
      if (item.permission && !userPermissions.includes(item.permission)) {
        return null;
      }

      // If item has children, filter them recursively
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterNavigationByPermissions(
          item.children,
          userPermissions,
          isAdmin,
        );

        // If no children remain accessible and item has no direct href link, hide parent
        if (filteredChildren.length === 0 && !item.href) {
          return null;
        }

        return {
          ...item,
          children: filteredChildren,
        };
      }

      return item;
    })
    .filter((item): item is NavigationItem => item !== null);
}

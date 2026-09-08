import { NavigationItem } from './navigation-config';

export interface SearchParamsLike {
  get: (key: string) => string | null;
  [key: string]: any;
}

/**
 * Checks if a specific leaf navigation item is active given the current pathname and searchParams.
 */
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
  searchParams?: SearchParamsLike | null
): boolean {
  if (!item.href) {
    return false;
  }

  const [itemPath, itemQueryString] = item.href.split('?');

  // Pathname must match exactly
  if (pathname !== itemPath) {
    return false;
  }

  // If the navigation item specifies query parameters (e.g., ?tab=add or ?type=staff)
  if (itemQueryString) {
    const itemParams = new URLSearchParams(itemQueryString);
    let allParamsMatch = true;
    itemParams.forEach((expectedValue, paramKey) => {
      const actualValue = searchParams?.get(paramKey);
      if (actualValue !== expectedValue) {
        allParamsMatch = false;
      }
    });
    return allParamsMatch;
  }

  // If the navigation item has NO query parameters (e.g., /students or /attendance or /dashboard):
  // It is the default/base route for that pathname.
  // It is active only if there is NO route-distinguishing parameter (such as 'tab' or 'type') active in the URL.
  const currentTab = searchParams?.get('tab');
  const currentType = searchParams?.get('type');

  if (currentTab || currentType) {
    return false;
  }

  return true;
}

/**
 * Checks if a navigation item OR any of its descendants is currently active.
 * Used for expanding parent accordions and highlighting parent group headers.
 */
export function isNavigationGroupActive(
  item: NavigationItem,
  pathname: string,
  searchParams?: SearchParamsLike | null
): boolean {
  // If the item itself has an href and is active
  if (isNavigationItemActive(item, pathname, searchParams)) {
    return true;
  }

  // If any child is active recursively
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => isNavigationGroupActive(child, pathname, searchParams));
  }

  return false;
}

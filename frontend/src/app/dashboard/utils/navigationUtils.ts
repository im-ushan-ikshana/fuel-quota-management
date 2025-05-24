import { SidebarLink } from '../types';

/**
 * Updates the 'current' property of navigation items based on the current path
 * @param navigation The navigation items array
 * @param currentPath The current path
 * @returns Updated navigation items with correct 'current' property
 */
export const updateCurrentNavigation = (
  navigation: SidebarLink[],
  currentPath: string
): SidebarLink[] => {
  return navigation.map(item => ({
    ...item,
    current: item.href === currentPath || 
             (currentPath !== '/' && item.href !== '/' && currentPath.startsWith(item.href))
  }));
};

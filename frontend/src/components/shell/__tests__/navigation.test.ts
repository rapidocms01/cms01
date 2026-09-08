import { navigationConfig } from '../navigation-config';
import { filterNavigationByPermissions } from '../permission-utils';
import { Permission, DefaultRole } from '@school-cms/common';

describe('Sidebar Navigation Permission Filtering Unit Tests', () => {
  test('Dashboard is accessible as a direct link without special permissions', () => {
    const dashboardItem = navigationConfig.find((item) => item.id === 'dashboard');
    expect(dashboardItem).toBeDefined();
    expect(dashboardItem?.href).toBe('/dashboard');
  });

  test('Institute Admin role retains access to all navigation categories', () => {
    const allPermissions = Object.values(Permission);
    const filtered = filterNavigationByPermissions(navigationConfig, allPermissions, true);
    expect(filtered.length).toBe(navigationConfig.length);
  });

  test('Teacher role receives relevant academic modules but hides Finance & Integrations', () => {
    const teacherPermissions = [
      Permission.STUDENTS_VIEW,
      Permission.ATTENDANCE_VIEW,
      Permission.ATTENDANCE_MARK,
      Permission.EXAMS_MANAGE,
      Permission.MARKS_ENTER,
      Permission.REPORTS_VIEW,
    ];

    const filtered = filterNavigationByPermissions(navigationConfig, teacherPermissions, false);
    const categoryIds = filtered.map((item) => item.id);

    expect(categoryIds).toContain('dashboard');
    expect(categoryIds).toContain('students');
    expect(categoryIds).toContain('attendance');
    expect(categoryIds).toContain('exams');
    expect(categoryIds).toContain('reports');

    // Finance, Integrations, and Roles should be hidden for Teacher
    expect(categoryIds).not.toContain('finance');
    expect(categoryIds).not.toContain('integrations');
    expect(categoryIds).not.toContain('roles');
  });

  test('Parent category disappears completely if no children are permitted', () => {
    // Only student permissions
    const studentOnlyPermissions = [Permission.STUDENTS_VIEW];
    const filtered = filterNavigationByPermissions(navigationConfig, studentOnlyPermissions, false);
    const categoryIds = filtered.map((item) => item.id);

    expect(categoryIds).toContain('dashboard');
    expect(categoryIds).toContain('students');
    expect(categoryIds).not.toContain('finance');
    expect(categoryIds).not.toContain('integrations');
    expect(categoryIds).not.toContain('settings');
  });
});

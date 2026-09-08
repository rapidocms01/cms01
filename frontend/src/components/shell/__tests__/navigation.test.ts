import { navigationConfig, NavigationItem } from '../navigation-config';
import { filterNavigationByPermissions } from '../permission-utils';
import { isNavigationItemActive, isNavigationGroupActive } from '../navigation-utils';
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

describe('Sidebar Navigation Active State Query Parameter Matching Unit Tests', () => {
  const studentsCategory = navigationConfig.find((item) => item.id === 'students')!;
  const attendanceCategory = navigationConfig.find((item) => item.id === 'attendance')!;
  const financeCategory = navigationConfig.find((item) => item.id === 'finance')!;
  const settingsCategory = navigationConfig.find((item) => item.id === 'settings')!;

  const createParams = (params: Record<string, string>) => ({
    get: (key: string) => params[key] || null,
  });

  test('/students?tab=add activates only Add Student and marks Student Management parent active', () => {
    const params = createParams({ tab: 'add' });
    const addStudent = studentsCategory.children!.find((c) => c.id === 'students-add')!;
    const directory = studentsCategory.children!.find((c) => c.id === 'students-directory')!;
    const importStudent = studentsCategory.children!.find((c) => c.id === 'students-import')!;
    const promotion = studentsCategory.children!.find((c) => c.id === 'students-promotion')!;
    const transfer = studentsCategory.children!.find((c) => c.id === 'students-transfer')!;

    // Only Add Student leaf should be active
    expect(isNavigationItemActive(addStudent, '/students', params)).toBe(true);
    expect(isNavigationItemActive(directory, '/students', params)).toBe(false);
    expect(isNavigationItemActive(importStudent, '/students', params)).toBe(false);
    expect(isNavigationItemActive(promotion, '/students', params)).toBe(false);
    expect(isNavigationItemActive(transfer, '/students', params)).toBe(false);

    // Parent group should be active
    expect(isNavigationGroupActive(studentsCategory, '/students', params)).toBe(true);
  });

  test('/students (default base route) activates only Student Directory and marks parent active', () => {
    const emptyParams = createParams({});
    const addStudent = studentsCategory.children!.find((c) => c.id === 'students-add')!;
    const directory = studentsCategory.children!.find((c) => c.id === 'students-directory')!;
    const importStudent = studentsCategory.children!.find((c) => c.id === 'students-import')!;

    expect(isNavigationItemActive(directory, '/students', emptyParams)).toBe(true);
    expect(isNavigationItemActive(addStudent, '/students', emptyParams)).toBe(false);
    expect(isNavigationItemActive(importStudent, '/students', emptyParams)).toBe(false);

    // Parent group should be active
    expect(isNavigationGroupActive(studentsCategory, '/students', emptyParams)).toBe(true);
  });

  test('/students?page=2 (table pagination without tab/type) keeps Student Directory active', () => {
    const paginationParams = createParams({ page: '2', search: 'john' });
    const addStudent = studentsCategory.children!.find((c) => c.id === 'students-add')!;
    const directory = studentsCategory.children!.find((c) => c.id === 'students-directory')!;

    expect(isNavigationItemActive(directory, '/students', paginationParams)).toBe(true);
    expect(isNavigationItemActive(addStudent, '/students', paginationParams)).toBe(false);
  });

  test('/attendance?type=staff activates only Staff Attendance and attendance parent', () => {
    const params = createParams({ type: 'staff' });
    const studentAtt = attendanceCategory.children!.find((c) => c.id === 'attendance-student')!;
    const staffAtt = attendanceCategory.children!.find((c) => c.id === 'attendance-staff')!;
    const historyAtt = attendanceCategory.children!.find((c) => c.id === 'attendance-history')!;

    expect(isNavigationItemActive(staffAtt, '/attendance', params)).toBe(true);
    expect(isNavigationItemActive(studentAtt, '/attendance', params)).toBe(false);
    expect(isNavigationItemActive(historyAtt, '/attendance', params)).toBe(false);
    expect(isNavigationGroupActive(attendanceCategory, '/attendance', params)).toBe(true);
  });

  test('/finance?tab=payment activates only Receive Payment leaf item', () => {
    const params = createParams({ tab: 'payment' });
    const dashboard = financeCategory.children!.find((c) => c.id === 'finance-dashboard')!;
    const payment = financeCategory.children!.find((c) => c.id === 'finance-payment')!;
    const ledger = financeCategory.children!.find((c) => c.id === 'finance-ledger')!;

    expect(isNavigationItemActive(payment, '/finance', params)).toBe(true);
    expect(isNavigationItemActive(dashboard, '/finance', params)).toBe(false);
    expect(isNavigationItemActive(ledger, '/finance', params)).toBe(false);
    expect(isNavigationGroupActive(financeCategory, '/finance', params)).toBe(true);
  });

  test('3-level nested route /settings?tab=classes activates class leaf and both parent groups', () => {
    const params = createParams({ tab: 'classes' });
    const academicGroup = settingsCategory.children!.find((c) => c.id === 'academic-setup')!;
    const classesItem = academicGroup.children!.find((c) => c.id === 'academic-classes')!;
    const sessionsItem = academicGroup.children!.find((c) => c.id === 'academic-sessions')!;
    const profileItem = settingsCategory.children!.find((c) => c.id === 'settings-profile')!;

    // Leaf checks
    expect(isNavigationItemActive(classesItem, '/settings', params)).toBe(true);
    expect(isNavigationItemActive(sessionsItem, '/settings', params)).toBe(false);
    expect(isNavigationItemActive(profileItem, '/settings', params)).toBe(false);

    // Group checks
    expect(isNavigationGroupActive(academicGroup, '/settings', params)).toBe(true);
    expect(isNavigationGroupActive(settingsCategory, '/settings', params)).toBe(true);
  });
});


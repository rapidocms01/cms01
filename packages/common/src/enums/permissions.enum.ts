export enum Permission {
  STUDENTS_VIEW = 'students.view',
  STUDENTS_CREATE = 'students.create',
  STUDENTS_EDIT = 'students.edit',
  STUDENTS_EXPORT = 'students.export',
  STUDENTS_DELETE = 'students.delete',

  STAFF_VIEW = 'staff.view',
  STAFF_MANAGE = 'staff.manage',
  STAFF_SALARY_VIEW = 'staff.salary_view',

  ATTENDANCE_VIEW = 'attendance.view',
  ATTENDANCE_MARK = 'attendance.mark',
  ATTENDANCE_EDIT_HISTORY = 'attendance.edit_history',

  FEES_VIEW = 'fees.view',
  FEES_RECEIVE = 'fees.receive',
  FEES_ADJUST = 'fees.adjust',
  FEES_EXPORT = 'fees.export',

  FINANCE_VIEW = 'finance.view',
  FINANCE_MANAGE = 'finance.manage',

  EXAMS_MANAGE = 'exams.manage',
  MARKS_ENTER = 'marks.enter',
  RESULTS_PUBLISH = 'results.publish',

  REPORTS_VIEW = 'reports.view',
  REPORTS_EXPORT = 'reports.export',

  USERS_MANAGE = 'users.manage',
  ROLES_MANAGE = 'roles.manage',
  SETTINGS_MANAGE = 'settings.manage',
  INTEGRATIONS_MANAGE = 'integrations.manage',

  AUDIT_VIEW = 'audit.view',
}

export enum PermissionScope {
  ALL = 'all',
  ASSIGNED_CLASS = 'assigned_class',
  ASSIGNED_SUBJECT = 'assigned_subject',
  OWN = 'own',
}

import { Injectable } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { Permission, DefaultRole } from '@school-cms/common';

@Injectable()
export class RbacService {
  async seedRolesAndPermissions(db: ISchoolDatabase) {
    let roles = await db.query('roles');
    if (roles.length === 0) {
      const adminRole = await db.insert('roles', {
        name: DefaultRole.INSTITUTE_ADMIN,
        description: 'Full administrative access',
        permissions: Object.values(Permission),
      });

      const principalRole = await db.insert('roles', {
        name: DefaultRole.PRINCIPAL,
        description: 'Academic and administrative oversight',
        permissions: [
          Permission.STUDENTS_VIEW,
          Permission.STUDENTS_CREATE,
          Permission.STUDENTS_EDIT,
          Permission.STAFF_VIEW,
          Permission.ATTENDANCE_VIEW,
          Permission.ATTENDANCE_MARK,
          Permission.FEES_VIEW,
          Permission.EXAMS_MANAGE,
          Permission.MARKS_ENTER,
          Permission.RESULTS_PUBLISH,
          Permission.REPORTS_VIEW,
          Permission.REPORTS_EXPORT,
        ],
      });

      const teacherRole = await db.insert('roles', {
        name: DefaultRole.TEACHER,
        description: 'Class teacher and subject instruction',
        permissions: [
          Permission.STUDENTS_VIEW,
          Permission.ATTENDANCE_VIEW,
          Permission.ATTENDANCE_MARK,
          Permission.EXAMS_MANAGE,
          Permission.MARKS_ENTER,
          Permission.REPORTS_VIEW,
        ],
      });

      const accountantRole = await db.insert('roles', {
        name: DefaultRole.ACCOUNTANT,
        description: 'Fee collection and financial ledger management',
        permissions: [
          Permission.STUDENTS_VIEW,
          Permission.FEES_VIEW,
          Permission.FEES_RECEIVE,
          Permission.FEES_ADJUST,
          Permission.FEES_EXPORT,
          Permission.FINANCE_VIEW,
          Permission.FINANCE_MANAGE,
          Permission.REPORTS_VIEW,
          Permission.REPORTS_EXPORT,
        ],
      });

      roles = [adminRole, principalRole, teacherRole, accountantRole];
    }
    return roles;
  }

  async getRoles(db: ISchoolDatabase) {
    return await this.seedRolesAndPermissions(db);
  }

  async createRole(db: ISchoolDatabase, data: any) {
    return await db.insert('roles', data);
  }

  async updateRolePermissions(db: ISchoolDatabase, roleId: string, permissions: string[]) {
    const updated = await db.update('roles', { id: roleId }, { permissions });
    return updated[0];
  }
}

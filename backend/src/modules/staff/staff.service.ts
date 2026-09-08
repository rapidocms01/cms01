import { Injectable, NotFoundException } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { IStaff, Permission } from '@school-cms/common';
import { AuditLoggerService } from '../audit/audit-logger.service';

@Injectable()
export class StaffService {
  constructor(private readonly auditLogger: AuditLoggerService) {}

  async seedDemoStaff(db: ISchoolDatabase) {
    const existing = await db.query('staff');
    if (existing.length === 0) {
      const demoStaff: Partial<IStaff>[] = [
        {
          staffIdNumber: 'TCH-2026-001',
          fullName: 'Muhammad Usman',
          gender: 'male',
          dateOfBirth: '1988-03-15',
          cnic: '35202-9988776-5',
          phone: '+92 300 5556677',
          email: 'usman.math@greenwood.edu',
          designation: 'Senior Mathematics Teacher',
          category: 'teacher',
          joiningDate: '2020-09-01',
          employmentStatus: 'active',
          salary: 75000,
          portalAccessEnabled: true,
        },
        {
          staffIdNumber: 'ACC-2026-002',
          fullName: 'Sobia Khan',
          gender: 'female',
          dateOfBirth: '1992-11-10',
          cnic: '35202-4433221-8',
          phone: '+92 300 8889900',
          email: 'accounts@greenwood.edu',
          designation: 'Head Accountant',
          category: 'accountant',
          joiningDate: '2021-02-15',
          employmentStatus: 'active',
          salary: 65000,
          portalAccessEnabled: true,
        },
      ];

      for (const st of demoStaff) {
        await db.insert('staff', st);
      }
    }
  }

  async getStaffList(
    db: ISchoolDatabase,
    query: { search?: string; category?: string; status?: string },
    userPermissions: string[],
  ) {
    await this.seedDemoStaff(db);
    let staffList = await db.query<IStaff>('staff');

    if (query.search) {
      const q = query.search.toLowerCase();
      staffList = staffList.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.staffIdNumber.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.includes(q),
      );
    }
    if (query.category) {
      staffList = staffList.filter((s) => s.category === query.category);
    }
    if (query.status) {
      staffList = staffList.filter((s) => s.employmentStatus === query.status);
    }

    const canViewSalary = userPermissions.includes(Permission.STAFF_SALARY_VIEW);

    return staffList.map((s) => {
      if (!canViewSalary) {
        const { salary, ...rest } = s;
        return rest;
      }
      return s;
    });
  }

  async getStaffById(db: ISchoolDatabase, id: string, userPermissions: string[]) {
    const records = await db.query<IStaff>('staff', { id });
    if (records.length === 0) throw new NotFoundException('Staff member not found');
    const staff = records[0];

    const canViewSalary = userPermissions.includes(Permission.STAFF_SALARY_VIEW);
    if (!canViewSalary) {
      delete staff.salary;
    }
    return staff;
  }

  async createStaff(db: ISchoolDatabase, data: any, userId: string) {
    if (!data.staffIdNumber) {
      data.staffIdNumber = `STF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }
    const created = await db.insert<IStaff>('staff', data);
    await this.auditLogger.log(db, {
      userId,
      action: 'STAFF_CREATE',
      resource: 'staff',
      resourceId: created.id,
      metadata: { fullName: created.fullName, category: created.category },
    });
    return created;
  }

  async updateStaff(db: ISchoolDatabase, id: string, data: any, userId: string) {
    const updated = await db.update('staff', { id }, data);
    await this.auditLogger.log(db, {
      userId,
      action: 'STAFF_UPDATE',
      resource: 'staff',
      resourceId: id,
      metadata: data,
    });
    return updated[0];
  }
}

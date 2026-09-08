import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { IStudent } from '@school-cms/common';
import { AuditLoggerService } from '../audit/audit-logger.service';

@Injectable()
export class StudentsService {
  constructor(private readonly auditLogger: AuditLoggerService) {}

  async seedDemoStudents(db: ISchoolDatabase) {
    const existing = await db.query('students');
    if (existing.length === 0) {
      const classes = await db.query('classes');
      const sections = await db.query('sections');
      const classId = classes[0]?.id || 'cls_1';
      const sectionId = sections[0]?.id || 'sec_1';

      const demoStudents: Partial<IStudent>[] = [
        {
          studentIdNumber: 'STD-2026-001',
          admissionNumber: 'ADM-1001',
          fullName: 'Ali Hassan',
          gender: 'male',
          dateOfBirth: '2015-05-12',
          bFormCnic: '35202-1234567-1',
          phone: '+92 300 1112233',
          guardianName: 'Hassan Raza',
          guardianRelation: 'Father',
          guardianPhone: '+92 300 1112233',
          academicSessionId: 'sess_2026',
          classId,
          sectionId,
          rollNumber: '01',
          admissionDate: '2026-04-01',
          status: 'active',
        },
        {
          studentIdNumber: 'STD-2026-002',
          admissionNumber: 'ADM-1002',
          fullName: 'Fatima Zahra',
          gender: 'female',
          dateOfBirth: '2015-08-20',
          bFormCnic: '35202-7654321-2',
          phone: '+92 300 4445566',
          guardianName: 'Tariq Mahmood',
          guardianRelation: 'Father',
          guardianPhone: '+92 300 4445566',
          academicSessionId: 'sess_2026',
          classId,
          sectionId,
          rollNumber: '02',
          admissionDate: '2026-04-02',
          status: 'active',
        },
      ];

      for (const s of demoStudents) {
        await db.insert('students', s);
      }
    }
  }

  async getStudents(
    db: ISchoolDatabase,
    query: {
      search?: string;
      classId?: string;
      sectionId?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
  ) {
    await this.seedDemoStudents(db);
    let students = await db.query<IStudent>('students');

    if (query.search) {
      const q = query.search.toLowerCase();
      students = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q) ||
          s.studentIdNumber.toLowerCase().includes(q) ||
          s.rollNumber.includes(q),
      );
    }

    if (query.classId) {
      students = students.filter((s) => s.classId === query.classId);
    }
    if (query.sectionId) {
      students = students.filter((s) => s.sectionId === query.sectionId);
    }
    if (query.status) {
      students = students.filter((s) => s.status === query.status);
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const total = students.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = students.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      meta: { total, page, limit, totalPages },
    };
  }

  async getStudentById(db: ISchoolDatabase, id: string) {
    const students = await db.query<IStudent>('students', { id });
    if (students.length === 0) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    const student = students[0];

    // Fetch 360 profile related records
    const attendance = await db.query('student_attendance', { entityId: id });
    const charges = await db.query('student_charges', { studentId: id });
    const payments = await db.query('payments', { studentId: id });
    const marks = await db.query('marks', { studentId: id });

    return {
      student,
      attendance,
      finance: { charges, payments },
      exams: marks,
    };
  }

  async createStudent(db: ISchoolDatabase, data: any, userId: string) {
    // Generate Admission Number if not provided
    if (!data.admissionNumber) {
      const existing = await db.query('students');
      data.admissionNumber = `ADM-${1000 + existing.length + 1}`;
    }
    if (!data.studentIdNumber) {
      data.studentIdNumber = `STD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }
    data.status = data.status || 'active';

    const created = await db.insert<IStudent>('students', data);

    await this.auditLogger.log(db, {
      userId,
      action: 'STUDENT_ADMISSION',
      resource: 'students',
      resourceId: created.id,
      metadata: { admissionNumber: created.admissionNumber, fullName: created.fullName },
    });

    return created;
  }

  async updateStudent(db: ISchoolDatabase, id: string, data: any, userId: string) {
    const existing = await db.query('students', { id });
    if (existing.length === 0) throw new NotFoundException(`Student not found`);

    const updated = await db.update('students', { id }, data);
    await this.auditLogger.log(db, {
      userId,
      action: 'STUDENT_UPDATE',
      resource: 'students',
      resourceId: id,
      metadata: data,
    });
    return updated[0];
  }

  async bulkImport(db: ISchoolDatabase, records: any[], userId: string) {
    const errors: { row: number; reason: string }[] = [];
    const imported: IStudent[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      if (!row.fullName || !row.guardianName || !row.guardianPhone) {
        errors.push({ row: i + 1, reason: 'Missing required fields: fullName, guardianName, or guardianPhone' });
        continue;
      }
      try {
        const student = await this.createStudent(db, row, userId);
        imported.push(student);
      } catch (err: any) {
        errors.push({ row: i + 1, reason: err.message });
      }
    }

    return {
      totalRows: records.length,
      importedCount: imported.length,
      errorCount: errors.length,
      errors,
      imported,
    };
  }

  async promoteStudents(db: ISchoolDatabase, studentIds: string[], targetClassId: string, targetSectionId: string, userId: string) {
    const updated: string[] = [];
    for (const id of studentIds) {
      await db.update('students', { id }, { classId: targetClassId, sectionId: targetSectionId });
      updated.push(id);
    }
    await this.auditLogger.log(db, {
      userId,
      action: 'STUDENTS_PROMOTED',
      resource: 'students',
      metadata: { targetClassId, targetSectionId, studentCount: updated.length },
    });
    return { success: true, count: updated.length };
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { AuditLoggerService } from '../audit/audit-logger.service';

export interface IMarkAttendanceDto {
  entityType: 'student' | 'staff';
  date: string;
  classId?: string;
  sectionId?: string;
  records: {
    entityId: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    remarks?: string;
  }[];
}

@Injectable()
export class AttendanceService {
  constructor(private readonly auditLogger: AuditLoggerService) {}

  async markAttendance(db: ISchoolDatabase, dto: IMarkAttendanceDto, userId: string) {
    const todayStr = dto.date || new Date().toISOString().split('T')[0];
    const table = dto.entityType === 'student' ? 'student_attendance' : 'staff_attendance';

    const savedRecords = [];
    for (const rec of dto.records) {
      // Check if record exists for this date and entity
      const existing = await db.query(table, {
        entityId: rec.entityId,
        date: todayStr,
      });

      if (existing.length > 0) {
        // Update existing record
        const updated = await db.update(
          table,
          { id: existing[0].id },
          {
            status: rec.status,
            remarks: rec.remarks || null,
            markedByUserId: userId,
          },
        );
        savedRecords.push(updated[0]);
      } else {
        // Insert new record
        const newRecord = await db.insert(table, {
          entityType: dto.entityType,
          entityId: rec.entityId,
          date: todayStr,
          status: rec.status,
          remarks: rec.remarks || null,
          classId: dto.classId || null,
          sectionId: dto.sectionId || null,
          markedByUserId: userId,
        });
        savedRecords.push(newRecord);
      }
    }

    await this.auditLogger.log(db, {
      userId,
      action: 'ATTENDANCE_MARKED',
      resource: table,
      metadata: {
        entityType: dto.entityType,
        date: todayStr,
        count: savedRecords.length,
      },
    });

    return savedRecords;
  }

  async getAttendanceHistory(
    db: ISchoolDatabase,
    query: {
      entityType: 'student' | 'staff';
      date?: string;
      classId?: string;
      sectionId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const table = query.entityType === 'student' ? 'student_attendance' : 'staff_attendance';
    let records = await db.query(table);

    if (query.date) {
      records = records.filter((r) => r.date === query.date);
    }
    if (query.classId) {
      records = records.filter((r) => r.classId === query.classId);
    }
    if (query.sectionId) {
      records = records.filter((r) => r.sectionId === query.sectionId);
    }
    if (query.startDate && query.endDate) {
      records = records.filter((r) => r.date >= query.startDate! && r.date <= query.endDate!);
    }

    return records;
  }

  async getMonthlySummary(
    db: ISchoolDatabase,
    entityType: 'student' | 'staff',
    monthYear: string, // YYYY-MM
    classId?: string,
  ) {
    const table = entityType === 'student' ? 'student_attendance' : 'staff_attendance';
    const records = await db.query(table);

    const filtered = records.filter((r) => r.date.startsWith(monthYear));

    // Aggregate by entityId
    const summaryMap = new Map<string, { present: number; absent: number; late: number; leave: number }>();

    for (const r of filtered) {
      if (!summaryMap.has(r.entityId)) {
        summaryMap.set(r.entityId, { present: 0, absent: 0, late: 0, leave: 0 });
      }
      const stats = summaryMap.get(r.entityId)!;
      if (r.status === 'present') stats.present++;
      else if (r.status === 'absent') stats.absent++;
      else if (r.status === 'late') stats.late++;
      else if (r.status === 'leave') stats.leave++;
    }

    return Array.from(summaryMap.entries()).map(([entityId, stats]) => ({
      entityId,
      ...stats,
      totalMarked: stats.present + stats.absent + stats.late + stats.leave,
    }));
  }
}

import { Injectable } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';

@Injectable()
export class ReportsService {
  async generateReport(
    db: ISchoolDatabase,
    type: 'students' | 'staff' | 'attendance' | 'fees' | 'finance' | 'exams',
    filters: any,
  ) {
    let rawData: any[] = [];

    switch (type) {
      case 'students':
        rawData = await db.query('students');
        if (filters.classId) rawData = rawData.filter((r) => r.classId === filters.classId);
        if (filters.status) rawData = rawData.filter((r) => r.status === filters.status);
        break;

      case 'staff':
        rawData = await db.query('staff');
        if (filters.category) rawData = rawData.filter((r) => r.category === filters.category);
        break;

      case 'attendance':
        rawData = await db.query('student_attendance');
        if (filters.date) rawData = rawData.filter((r) => r.date === filters.date);
        break;

      case 'fees':
        rawData = await db.query('payments');
        break;

      case 'finance':
        const income = await db.query('income_transactions');
        const expenses = await db.query('expense_transactions');
        rawData = [
          ...income.map((i) => ({ ...i, categoryType: 'income' })),
          ...expenses.map((e) => ({ ...e, categoryType: 'expense' })),
        ];
        break;

      case 'exams':
        rawData = await db.query('marks');
        break;
    }

    return {
      reportType: type,
      generatedAt: new Date().toISOString(),
      recordCount: rawData.length,
      data: rawData,
    };
  }

  exportCsv(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }
}

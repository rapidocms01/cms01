import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { AuditLoggerService } from '../audit/audit-logger.service';

@Injectable()
export class ExamsService {
  constructor(private readonly auditLogger: AuditLoggerService) {}

  async getExams(db: ISchoolDatabase) {
    let exams = await db.query('exams');
    if (exams.length === 0) {
      const classes = await db.query('classes');
      const classId = classes[0]?.id || 'cls_1';
      exams = [
        await db.insert('exams', {
          name: 'Mid-Term Examinations 2026',
          academicSessionId: 'sess_2026',
          classId,
          startDate: '2026-10-15',
          endDate: '2026-10-25',
          status: 'open',
        }),
      ];
    }
    return exams;
  }

  async createExam(db: ISchoolDatabase, data: any, userId: string) {
    data.status = data.status || 'draft';
    const created = await db.insert('exams', data);
    await this.auditLogger.log(db, {
      userId,
      action: 'EXAM_CREATE',
      resource: 'exams',
      resourceId: created.id,
      metadata: { name: created.name },
    });
    return created;
  }

  async updateExamStatus(db: ISchoolDatabase, id: string, status: string, userId: string) {
    const existing = await db.query('exams', { id });
    if (existing.length === 0) throw new NotFoundException('Exam not found');

    const updated = await db.update('exams', { id }, { status });

    if (status === 'published') {
      await this.auditLogger.log(db, {
        userId,
        action: 'RESULTS_PUBLISHED',
        resource: 'exams',
        resourceId: id,
        metadata: { examName: existing[0].name },
      });
    }

    return updated[0];
  }

  // Bulk Marks Entry for Spreadsheet Grid
  async saveBulkMarks(
    db: ISchoolDatabase,
    examId: string,
    subjectId: string,
    records: {
      studentId: string;
      marksObtained: number | null;
      isAbsent: boolean;
      maxMarks: number;
      passingMarks: number;
    }[],
    userId: string,
  ) {
    const exam = await db.query('exams', { id: examId });
    if (exam.length > 0 && exam[0].status === 'published') {
      await this.auditLogger.log(db, {
        userId,
        action: 'PUBLISHED_MARKS_EDIT',
        resource: 'marks',
        metadata: { examId, subjectId, count: records.length },
      });
    }

    const saved = [];
    for (const rec of records) {
      const existing = await db.query('marks', {
        examId,
        subjectId,
        studentId: rec.studentId,
      });

      if (existing.length > 0) {
        const updated = await db.update(
          'marks',
          { id: existing[0].id },
          {
            marksObtained: rec.isAbsent ? null : rec.marksObtained,
            isAbsent: rec.isAbsent,
            maxMarks: rec.maxMarks,
            passingMarks: rec.passingMarks,
            enteredByUserId: userId,
          },
        );
        saved.push(updated[0]);
      } else {
        const inserted = await db.insert('marks', {
          examId,
          subjectId,
          studentId: rec.studentId,
          marksObtained: rec.isAbsent ? null : rec.marksObtained,
          isAbsent: rec.isAbsent,
          maxMarks: rec.maxMarks,
          passingMarks: rec.passingMarks,
          enteredByUserId: userId,
        });
        saved.push(inserted);
      }
    }

    return saved;
  }

  async getMarksForExamSubject(db: ISchoolDatabase, examId: string, subjectId: string) {
    return await db.query('marks', { examId, subjectId });
  }

  // Result Calculation & Report Card Generator Data
  async getStudentReportCard(db: ISchoolDatabase, examId: string, studentId: string) {
    const studentArr = await db.query('students', { id: studentId });
    if (studentArr.length === 0) throw new NotFoundException('Student not found');
    const student = studentArr[0];

    const examArr = await db.query('exams', { id: examId });
    if (examArr.length === 0) throw new NotFoundException('Exam not found');
    const exam = examArr[0];

    const marks = await db.query('marks', { examId, studentId });
    const subjects = await db.query('subjects');
    const gradingSchemes = await db.query('grading_schemes');
    const profileArr = await db.query('institute_settings');
    const institute = profileArr[0] || { instituteName: 'School Management' };

    let totalMax = 0;
    let totalObtained = 0;
    let hasFail = false;

    const subjectBreakdown = marks.map((m) => {
      const subj = subjects.find((s) => s.id === m.subjectId) || { name: 'Subject' };
      const obtained = m.isAbsent ? 0 : m.marksObtained || 0;
      totalMax += m.maxMarks || 100;
      totalObtained += obtained;

      const isPassed = !m.isAbsent && obtained >= (m.passingMarks || 33);
      if (!isPassed) hasFail = true;

      const pct = (obtained / (m.maxMarks || 100)) * 100;
      const matchedGrade = gradingSchemes.find((g) => pct >= g.minPercentage && pct <= g.maxPercentage);

      return {
        subjectName: subj.name,
        maxMarks: m.maxMarks,
        passingMarks: m.passingMarks,
        marksObtained: m.isAbsent ? 'ABSENT' : obtained,
        grade: matchedGrade ? matchedGrade.grade : 'N/A',
        isPassed,
      };
    });

    const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const finalGradeObj = gradingSchemes.find((g) => overallPct >= g.minPercentage && overallPct <= g.maxPercentage);

    return {
      institute,
      exam,
      student,
      subjectBreakdown,
      summary: {
        totalMax,
        totalObtained,
        percentage: Number(overallPct.toFixed(2)),
        grade: finalGradeObj ? finalGradeObj.grade : 'N/A',
        remarks: finalGradeObj ? finalGradeObj.remarks : '',
        status: hasFail ? 'FAIL' : 'PASS',
      },
    };
  }
}

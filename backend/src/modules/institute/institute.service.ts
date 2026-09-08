import { Injectable } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';

@Injectable()
export class InstituteService {
  async getProfile(db: ISchoolDatabase) {
    const profiles = await db.query('institute_settings');
    if (profiles.length === 0) {
      return {
        instituteName: 'Greenwood International School',
        logoUrl: null,
        address: '123 Education Boulevard, City',
        phone: '+92 42 111 222 333',
        email: 'info@greenwood.edu',
        principalName: 'Dr. Sarah Ahmed',
      };
    }
    return profiles[0];
  }

  async updateProfile(db: ISchoolDatabase, data: any) {
    const existing = await db.query('institute_settings');
    if (existing.length === 0) {
      return await db.insert('institute_settings', data);
    } else {
      const updated = await db.update('institute_settings', { id: existing[0].id }, data);
      return updated[0];
    }
  }

  // Academic Sessions
  async getSessions(db: ISchoolDatabase) {
    let sessions = await db.query('academic_sessions');
    if (sessions.length === 0) {
      // Seed default session
      const defaultSession = await db.insert('academic_sessions', {
        name: '2026-2027',
        startDate: '2026-04-01',
        endDate: '2027-03-31',
        isCurrent: true,
        status: 'active',
      });
      sessions = [defaultSession];
    }
    return sessions;
  }

  async createSession(db: ISchoolDatabase, data: any) {
    if (data.isCurrent) {
      // Set existing current sessions to false
      const all = await db.query('academic_sessions');
      for (const s of all) {
        await db.update('academic_sessions', { id: s.id }, { isCurrent: false });
      }
    }
    return await db.insert('academic_sessions', data);
  }

  // Classes & Sections
  async getClasses(db: ISchoolDatabase) {
    let classes = await db.query('classes');
    if (classes.length === 0) {
      const c1 = await db.insert('classes', { name: 'Grade 1', code: 'G1' });
      const c2 = await db.insert('classes', { name: 'Grade 2', code: 'G2' });
      const c3 = await db.insert('classes', { name: 'Grade 3', code: 'G3' });

      await db.insert('sections', { classId: c1.id, name: 'A', capacity: 30 });
      await db.insert('sections', { classId: c1.id, name: 'B', capacity: 30 });
      await db.insert('sections', { classId: c2.id, name: 'A', capacity: 30 });
      await db.insert('sections', { classId: c3.id, name: 'A', capacity: 30 });

      classes = [c1, c2, c3];
    }

    const sections = await db.query('sections');
    return classes.map((c) => ({
      ...c,
      sections: sections.filter((sec) => sec.classId === c.id),
    }));
  }

  async createClass(db: ISchoolDatabase, data: any) {
    const newClass = await db.insert('classes', { name: data.name, code: data.code });
    if (data.sections && Array.isArray(data.sections)) {
      for (const secName of data.sections) {
        await db.insert('sections', { classId: newClass.id, name: secName });
      }
    }
    return newClass;
  }

  // Subjects
  async getSubjects(db: ISchoolDatabase) {
    let subjects = await db.query('subjects');
    if (subjects.length === 0) {
      const s1 = await db.insert('subjects', { name: 'Mathematics', code: 'MATH-101', type: 'theory' });
      const s2 = await db.insert('subjects', { name: 'English Language', code: 'ENG-101', type: 'theory' });
      const s3 = await db.insert('subjects', { name: 'General Science', code: 'SCI-101', type: 'both' });
      subjects = [s1, s2, s3];
    }
    return subjects;
  }

  async createSubject(db: ISchoolDatabase, data: any) {
    return await db.insert('subjects', data);
  }

  // Grading System
  async getGradingSystem(db: ISchoolDatabase) {
    let grades = await db.query('grading_schemes');
    if (grades.length === 0) {
      grades = [
        await db.insert('grading_schemes', { minPercentage: 90, maxPercentage: 100, grade: 'A+', remarks: 'Outstanding' }),
        await db.insert('grading_schemes', { minPercentage: 80, maxPercentage: 89, grade: 'A', remarks: 'Excellent' }),
        await db.insert('grading_schemes', { minPercentage: 70, maxPercentage: 79, grade: 'B', remarks: 'Very Good' }),
        await db.insert('grading_schemes', { minPercentage: 60, maxPercentage: 69, grade: 'C', remarks: 'Good' }),
        await db.insert('grading_schemes', { minPercentage: 50, maxPercentage: 59, grade: 'D', remarks: 'Satisfactory' }),
        await db.insert('grading_schemes', { minPercentage: 0, maxPercentage: 49, grade: 'F', remarks: 'Fail' }),
      ];
    }
    return grades;
  }

  async updateGradingSystem(db: ISchoolDatabase, schemes: any[]) {
    await db.clear('grading_schemes');
    const inserted = [];
    for (const scheme of schemes) {
      inserted.push(await db.insert('grading_schemes', scheme));
    }
    return inserted;
  }
}

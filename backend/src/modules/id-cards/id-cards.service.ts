import { Injectable } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';

@Injectable()
export class IdCardsService {
  async getTemplate(db: ISchoolDatabase) {
    const templates = await db.query('id_card_templates');
    if (templates.length === 0) {
      return {
        id: 'default_template',
        primaryColor: '#1e3a8a',
        accentColor: '#f59e0b',
        showBarcode: true,
        showAddress: true,
        showPhone: true,
        headerTitle: 'GREENWOOD INTERNATIONAL SCHOOL',
      };
    }
    return templates[0];
  }

  async saveTemplate(db: ISchoolDatabase, data: any) {
    const existing = await db.query('id_card_templates');
    if (existing.length === 0) {
      return await db.insert('id_card_templates', data);
    } else {
      const updated = await db.update('id_card_templates', { id: existing[0].id }, data);
      return updated[0];
    }
  }

  async generateBatchData(
    db: ISchoolDatabase,
    type: 'student' | 'staff',
    ids: string[],
  ) {
    const template = await this.getTemplate(db);
    const profileArr = await db.query('institute_settings');
    const institute = profileArr[0] || { instituteName: 'Greenwood International School' };

    let items = [];
    if (type === 'student') {
      const students = await db.query('students');
      items = students.filter((s) => ids.includes(s.id));
    } else {
      const staff = await db.query('staff');
      items = staff.filter((s) => ids.includes(s.id));
    }

    return {
      template,
      institute,
      cards: items,
    };
  }
}

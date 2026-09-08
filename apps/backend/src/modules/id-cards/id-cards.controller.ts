import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { IdCardsService } from './id-cards.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';

@Controller('api/id-cards')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard)
export class IdCardsController {
  constructor(private readonly idCardsService: IdCardsService) {}

  @Get('template')
  async getTemplate(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.idCardsService.getTemplate(db) };
  }

  @Post('template')
  async saveTemplate(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.idCardsService.saveTemplate(db, body) };
  }

  @Post('batch')
  async generateBatch(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: { type: 'student' | 'staff'; ids: string[] },
  ) {
    const data = await this.idCardsService.generateBatchData(
      db,
      body.type || 'student',
      body.ids || [],
    );
    return { success: true, data };
  }
}

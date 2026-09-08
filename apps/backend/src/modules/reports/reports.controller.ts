import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @RequirePermissions(Permission.REPORTS_VIEW)
  async getReport(
    @SchoolDb() db: ISchoolDatabase,
    @Query('type') type: 'students' | 'staff' | 'attendance' | 'fees' | 'finance' | 'exams',
    @Query('classId') classId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    const reportType = type || 'students';
    const data = await this.reportsService.generateReport(db, reportType, {
      classId,
      category,
      status,
      date,
    });
    return { success: true, data };
  }

  @Get('export/csv')
  @RequirePermissions(Permission.REPORTS_EXPORT)
  async exportCsv(
    @SchoolDb() db: ISchoolDatabase,
    @Query('type') type: 'students' | 'staff' | 'attendance' | 'fees' | 'finance' | 'exams',
    @Res() res: Response,
  ) {
    const reportType = type || 'students';
    const report = await this.reportsService.generateReport(db, reportType, {});
    const csvContent = this.reportsService.exportCsv(report.data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
    res.status(200).send(csvContent);
  }
}

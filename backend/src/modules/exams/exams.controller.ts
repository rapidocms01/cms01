import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/exams')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @RequirePermissions(Permission.EXAMS_MANAGE)
  async getExams(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.examsService.getExams(db) };
  }

  @Post()
  @RequirePermissions(Permission.EXAMS_MANAGE)
  async createExam(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.examsService.createExam(db, body, userId);
    return { success: true, data };
  }

  @Put(':id/status')
  @RequirePermissions(Permission.RESULTS_PUBLISH)
  async updateStatus(
    @SchoolDb() db: ISchoolDatabase,
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.examsService.updateExamStatus(db, id, status, userId);
    return { success: true, data };
  }

  @Get('marks')
  @RequirePermissions(Permission.MARKS_ENTER)
  async getMarks(
    @SchoolDb() db: ISchoolDatabase,
    @Query('examId') examId: string,
    @Query('subjectId') subjectId: string,
  ) {
    const data = await this.examsService.getMarksForExamSubject(db, examId, subjectId);
    return { success: true, data };
  }

  @Post('marks/bulk')
  @RequirePermissions(Permission.MARKS_ENTER)
  async saveBulkMarks(
    @SchoolDb() db: ISchoolDatabase,
    @Body()
    body: {
      examId: string;
      subjectId: string;
      records: any[];
    },
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.examsService.saveBulkMarks(
      db,
      body.examId,
      body.subjectId,
      body.records || [],
      userId,
    );
    return { success: true, data };
  }

  @Get('report-card/:examId/:studentId')
  @RequirePermissions(Permission.EXAMS_MANAGE)
  async getReportCard(
    @SchoolDb() db: ISchoolDatabase,
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
  ) {
    const data = await this.examsService.getStudentReportCard(db, examId, studentId);
    return { success: true, data };
  }
}

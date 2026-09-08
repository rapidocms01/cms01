import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttendanceService, IMarkAttendanceDto } from './attendance.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/attendance')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  @RequirePermissions(Permission.ATTENDANCE_MARK)
  async markAttendance(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: IMarkAttendanceDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.attendanceService.markAttendance(db, body, userId);
    return { success: true, data };
  }

  @Get('history')
  @RequirePermissions(Permission.ATTENDANCE_VIEW)
  async getHistory(
    @SchoolDb() db: ISchoolDatabase,
    @Query('entityType') entityType: 'student' | 'staff',
    @Query('date') date?: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.attendanceService.getAttendanceHistory(db, {
      entityType: entityType || 'student',
      date,
      classId,
      sectionId,
      startDate,
      endDate,
    });
    return { success: true, data };
  }

  @Get('summary')
  @RequirePermissions(Permission.ATTENDANCE_VIEW)
  async getSummary(
    @SchoolDb() db: ISchoolDatabase,
    @Query('entityType') entityType: 'student' | 'staff',
    @Query('monthYear') monthYear: string,
    @Query('classId') classId?: string,
  ) {
    const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
    const data = await this.attendanceService.getMonthlySummary(
      db,
      entityType || 'student',
      targetMonth,
      classId,
    );
    return { success: true, data };
  }
}

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
import { StudentsService } from './students.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/students')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @RequirePermissions(Permission.STUDENTS_VIEW)
  async getStudents(
    @SchoolDb() db: ISchoolDatabase,
    @Query('search') search?: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.studentsService.getStudents(db, {
      search,
      classId,
      sectionId,
      status,
      page,
      limit,
    });
    return { success: true, data: result.items, meta: result.meta };
  }

  @Get(':id')
  @RequirePermissions(Permission.STUDENTS_VIEW)
  async getStudentById(@SchoolDb() db: ISchoolDatabase, @Param('id') id: string) {
    const data = await this.studentsService.getStudentById(db, id);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(Permission.STUDENTS_CREATE)
  async createStudent(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.studentsService.createStudent(db, body, userId);
    return { success: true, data };
  }

  @Put(':id')
  @RequirePermissions(Permission.STUDENTS_EDIT)
  async updateStudent(
    @SchoolDb() db: ISchoolDatabase,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.studentsService.updateStudent(db, id, body, userId);
    return { success: true, data };
  }

  @Post('import')
  @RequirePermissions(Permission.STUDENTS_CREATE)
  async bulkImport(
    @SchoolDb() db: ISchoolDatabase,
    @Body('records') records: any[],
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.studentsService.bulkImport(db, records || [], userId);
    return { success: true, data };
  }

  @Post('promote')
  @RequirePermissions(Permission.STUDENTS_EDIT)
  async promote(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: { studentIds: string[]; targetClassId: string; targetSectionId: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.studentsService.promoteStudents(
      db,
      body.studentIds,
      body.targetClassId,
      body.targetSectionId,
      userId,
    );
    return { success: true, data };
  }
}

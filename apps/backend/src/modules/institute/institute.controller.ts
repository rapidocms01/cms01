import { Controller, Get, Post, Body, Put, UseGuards } from '@nestjs/common';
import { InstituteService } from './institute.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/settings')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class InstituteController {
  constructor(private readonly instituteService: InstituteService) {}

  @Get('profile')
  async getProfile(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.instituteService.getProfile(db) };
  }

  @Put('profile')
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  async updateProfile(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.instituteService.updateProfile(db, body) };
  }

  @Get('sessions')
  async getSessions(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.instituteService.getSessions(db) };
  }

  @Post('sessions')
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  async createSession(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.instituteService.createSession(db, body) };
  }

  @Get('classes')
  async getClasses(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.instituteService.getClasses(db) };
  }

  @Post('classes')
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  async createClass(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.instituteService.createClass(db, body) };
  }

  @Get('subjects')
  async getSubjects(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.instituteService.getSubjects(db) };
  }

  @Post('subjects')
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  async createSubject(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.instituteService.createSubject(db, body) };
  }

  @Get('grading')
  async getGrading(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.instituteService.getGradingSystem(db) };
  }

  @Put('grading')
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  async updateGrading(@SchoolDb() db: ISchoolDatabase, @Body() body: any[]) {
    return { success: true, data: await this.instituteService.updateGradingSystem(db, body) };
  }
}

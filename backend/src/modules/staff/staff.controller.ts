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
import { StaffService } from './staff.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/staff')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @RequirePermissions(Permission.STAFF_VIEW)
  async getStaffList(
    @SchoolDb() db: ISchoolDatabase,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Req() req?: any,
  ) {
    const permissions = req?.user?.permissions || [];
    const data = await this.staffService.getStaffList(
      db,
      { search, category, status },
      permissions,
    );
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(Permission.STAFF_VIEW)
  async getStaffById(
    @SchoolDb() db: ISchoolDatabase,
    @Param('id') id: string,
    @Req() req?: any,
  ) {
    const permissions = req?.user?.permissions || [];
    const data = await this.staffService.getStaffById(db, id, permissions);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(Permission.STAFF_MANAGE)
  async createStaff(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: any,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || 'usr_system';
    const data = await this.staffService.createStaff(db, body, userId);
    return { success: true, data };
  }

  @Put(':id')
  @RequirePermissions(Permission.STAFF_MANAGE)
  async updateStaff(
    @SchoolDb() db: ISchoolDatabase,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id || 'usr_system';
    const data = await this.staffService.updateStaff(db, id, body, userId);
    return { success: true, data };
  }
}

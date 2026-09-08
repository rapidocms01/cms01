import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/roles')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @RequirePermissions(Permission.ROLES_MANAGE)
  async getRoles(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.rbacService.getRoles(db) };
  }

  @Post()
  @RequirePermissions(Permission.ROLES_MANAGE)
  async createRole(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.rbacService.createRole(db, body) };
  }

  @Put(':id/permissions')
  @RequirePermissions(Permission.ROLES_MANAGE)
  async updateRolePermissions(
    @SchoolDb() db: ISchoolDatabase,
    @Param('id') id: string,
    @Body('permissions') permissions: string[],
  ) {
    return {
      success: true,
      data: await this.rbacService.updateRolePermissions(db, id, permissions || []),
    };
  }
}

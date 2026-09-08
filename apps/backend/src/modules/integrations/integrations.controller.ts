import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/integrations')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @RequirePermissions(Permission.INTEGRATIONS_MANAGE)
  async getConfigs(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.integrationsService.getConfigs(db) };
  }

  @Put(':id')
  @RequirePermissions(Permission.INTEGRATIONS_MANAGE)
  async saveConfig(
    @SchoolDb() db: ISchoolDatabase,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return { success: true, data: await this.integrationsService.saveConfig(db, id, body) };
  }

  @Post(':id/test')
  @RequirePermissions(Permission.INTEGRATIONS_MANAGE)
  async testConnection(@SchoolDb() db: ISchoolDatabase, @Param('id') id: string) {
    return { success: true, data: await this.integrationsService.testConnection(db, id) };
  }

  @Get('logs')
  @RequirePermissions(Permission.INTEGRATIONS_MANAGE)
  async getLogs(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.integrationsService.getLogs(db) };
  }
}

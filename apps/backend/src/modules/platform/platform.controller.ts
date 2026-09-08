import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { CentralDatabaseService } from '../../database/central-database.service';
import { MultiTenantMigratorService } from '../../database/multi-tenant-migrator.service';
import { SubscriptionStatus } from '@school-cms/common';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';

@Controller('api/platform')
@UseGuards(JwtAuthGuard)
export class PlatformController {
  constructor(
    private readonly centralDb: CentralDatabaseService,
    private readonly migrator: MultiTenantMigratorService,
  ) {}

  @Get('tenants')
  async listTenants() {
    const tenants = await this.centralDb.getAllTenants();
    return { success: true, data: tenants };
  }

  @Patch('tenants/:id/subscription')
  async updateSubscription(
    @Param('id') tenantId: string,
    @Body('status') status: SubscriptionStatus,
  ) {
    const tenant = await this.centralDb.updateSubscriptionStatus(tenantId, status);
    return {
      success: true,
      message: `Updated tenant ${tenantId} subscription status to ${status}`,
      data: tenant,
    };
  }

  @Post('migrations/run')
  async runMigrations() {
    const reports = await this.migrator.migrateAllTenants();
    return { success: true, data: reports };
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantResolverService } from './tenant-resolver.service';
import { TenantConnectionManager } from '../../database/tenant-database.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantResolver: TenantResolverService,
    private readonly connectionManager: TenantConnectionManager,
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    const tenant = await this.tenantResolver.resolveTenantFromRequest(req);
    if (tenant) {
      req.tenant = tenant;
      req.schoolDb = this.connectionManager.getTenantDatabase(tenant.id);
    }
    next();
  }
}

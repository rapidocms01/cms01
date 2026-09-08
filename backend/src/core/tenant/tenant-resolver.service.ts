import { Injectable, Logger } from '@nestjs/common';
import { ITenant } from '@school-cms/common';
import { CentralDatabaseService } from '../../database/central-database.service';

@Injectable()
export class TenantResolverService {
  private readonly logger = new Logger(TenantResolverService.name);

  constructor(private readonly centralDb: CentralDatabaseService) {}

  async resolveTenantFromRequest(req: any): Promise<ITenant | null> {
    // 1. Header resolution (explicit tenant ID or subdomain)
    const headerTenantId = req.headers['x-tenant-id'];
    if (headerTenantId) {
      const tenant = await this.centralDb.findTenantById(headerTenantId);
      if (tenant) return tenant;
    }

    const headerSubdomain = req.headers['x-tenant-subdomain'];
    if (headerSubdomain) {
      const tenant = await this.centralDb.findTenantBySubdomain(headerSubdomain);
      if (tenant) return tenant;
    }

    // 2. Subdomain from Host header
    const host = req.headers['host'] || '';
    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      const parts = host.split('.');
      if (parts.length >= 3) {
        const subdomain = parts[0];
        const tenant = await this.centralDb.findTenantBySubdomain(subdomain);
        if (tenant) return tenant;
      }
    }

    // 3. Fallback to default demo school tenant for local development/testing
    const defaultTenant = await this.centralDb.findTenantBySubdomain('greenwood');
    return defaultTenant;
  }
}

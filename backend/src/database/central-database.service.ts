import { Injectable, NotFoundException } from '@nestjs/common';
import { ITenant, ITenantConnectionConfig, SubscriptionStatus } from '@school-cms/common';
import { SecretCryptoService } from '../core/security/secret-crypto.service';

@Injectable()
export class CentralDatabaseService {
  private tenants = new Map<string, ITenant>();
  private tenantDomains = new Map<string, string>(); // subdomain -> tenantId
  private tenantConnections = new Map<string, ITenantConnectionConfig>();

  constructor(private readonly cryptoService: SecretCryptoService) {
    // Seed initial demo school tenant for local development & testing
    this.seedDemoTenants();
  }

  private seedDemoTenants() {
    const demoTenant: ITenant = {
      id: 'tenant-school-a',
      instituteName: 'Greenwood International School',
      instituteLogo: null,
      subdomain: 'greenwood',
      ownerName: 'Dr. Sarah Ahmed',
      ownerEmail: 'owner@greenwood.edu',
      ownerPhone: '+92 300 1234567',
      ownerWhatsapp: '+92 300 1234567',
      accountStatus: SubscriptionStatus.ACTIVE,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      trialStart: new Date().toISOString(),
      trialEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const encryptedServiceKey = this.cryptoService.encrypt('demo_supabase_service_role_key_school_a');
    const demoConnection: ITenantConnectionConfig = {
      tenantId: demoTenant.id,
      supabaseUrl: 'https://demo-school-a.supabase.co',
      supabaseAnonKey: 'demo_supabase_anon_key_school_a',
      supabaseServiceKey: encryptedServiceKey,
    };

    this.tenants.set(demoTenant.id, demoTenant);
    this.tenantDomains.set(demoTenant.subdomain.toLowerCase(), demoTenant.id);
    this.tenantConnections.set(demoTenant.id, demoConnection);
  }

  async findTenantBySubdomain(subdomain: string): Promise<ITenant | null> {
    const tenantId = this.tenantDomains.get(subdomain.toLowerCase());
    if (!tenantId) return null;
    return this.tenants.get(tenantId) || null;
  }

  async findTenantById(id: string): Promise<ITenant | null> {
    return this.tenants.get(id) || null;
  }

  async getConnectionConfig(tenantId: string): Promise<ITenantConnectionConfig | null> {
    const config = this.tenantConnections.get(tenantId);
    if (!config) return null;

    // Decrypt service key before returning to backend services (NEVER to frontend!)
    return {
      ...config,
      supabaseServiceKey: this.cryptoService.decrypt(config.supabaseServiceKey),
    };
  }

  async registerTenant(tenant: ITenant, config: ITenantConnectionConfig): Promise<ITenant> {
    const encryptedConfig = {
      ...config,
      supabaseServiceKey: this.cryptoService.encrypt(config.supabaseServiceKey),
    };

    this.tenants.set(tenant.id, tenant);
    this.tenantDomains.set(tenant.subdomain.toLowerCase(), tenant.id);
    this.tenantConnections.set(tenant.id, encryptedConfig);
    return tenant;
  }

  async updateSubscriptionStatus(tenantId: string, status: SubscriptionStatus): Promise<ITenant> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    tenant.subscriptionStatus = status;
    tenant.accountStatus = status;
    tenant.updatedAt = new Date().toISOString();
    this.tenants.set(tenantId, tenant);
    return tenant;
  }

  async getAllTenants(): Promise<ITenant[]> {
    return Array.from(this.tenants.values());
  }
}

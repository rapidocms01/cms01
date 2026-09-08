import { Injectable, Logger } from '@nestjs/common';
import { CentralDatabaseService } from './central-database.service';
import { TenantConnectionManager } from './tenant-database.service';

export interface IMigrationScript {
  version: string;
  description: string;
  run: (db: any) => Promise<void>;
}

export interface IMigrationReport {
  tenantId: string;
  appliedCount: number;
  currentVersion: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
}

@Injectable()
export class MultiTenantMigratorService {
  private readonly logger = new Logger(MultiTenantMigratorService.name);
  private readonly migrations: IMigrationScript[] = [
    {
      version: '1.0.0',
      description: 'Initial school operational tables schema setup',
      run: async (db) => {
        // Migration logic for initial tables
        this.logger.log(`Running migration 1.0.0 on tenant ${db.tenantId}`);
      },
    },
    {
      version: '1.1.0',
      description: 'Add indexes and audit log metadata column',
      run: async (db) => {
        this.logger.log(`Running migration 1.1.0 on tenant ${db.tenantId}`);
      },
    },
  ];

  constructor(
    private readonly centralDb: CentralDatabaseService,
    private readonly connectionManager: TenantConnectionManager,
  ) {}

  async migrateTenant(tenantId: string): Promise<IMigrationReport> {
    const db = this.connectionManager.getTenantDatabase(tenantId);
    let appliedCount = 0;
    let currentVersion = '0.0.0';

    try {
      const appliedMigrations = await db.query('_schema_migrations');
      const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

      for (const script of this.migrations) {
        if (!appliedVersions.has(script.version)) {
          const startTime = Date.now();
          await script.run(db);
          const durationMs = Date.now() - startTime;

          await db.insert('_schema_migrations', {
            version: script.version,
            description: script.description,
            appliedAt: new Date().toISOString(),
            executionTimeMs: durationMs,
            success: true,
          });

          appliedCount++;
          currentVersion = script.version;
        } else {
          currentVersion = script.version;
        }
      }

      return {
        tenantId,
        appliedCount,
        currentVersion,
        status: 'SUCCESS',
      };
    } catch (err: any) {
      this.logger.error(`Migration failed for tenant ${tenantId}: ${err.message}`);
      return {
        tenantId,
        appliedCount,
        currentVersion,
        status: 'FAILED',
        error: err.message,
      };
    }
  }

  async migrateAllTenants(): Promise<IMigrationReport[]> {
    const tenants = await this.centralDb.getAllTenants();
    const reports: IMigrationReport[] = [];

    for (const tenant of tenants) {
      const report = await this.migrateTenant(tenant.id);
      reports.push(report);
    }

    return reports;
  }
}

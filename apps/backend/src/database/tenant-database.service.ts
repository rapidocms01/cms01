import { Injectable, Logger } from '@nestjs/common';
import { ITenantConnectionConfig } from '@school-cms/common';

export interface ISchoolDatabase {
  tenantId: string;
  query<T = any>(table: string, filter?: any): Promise<T[]>;
  insert<T = any>(table: string, data: any): Promise<T>;
  update<T = any>(table: string, filter: any, data: any): Promise<T[]>;
  delete(table: string, filter: any): Promise<number>;
  clear(table: string): Promise<void>;
  getTableData(table: string): any[];
}

class InMemSchoolDatabase implements ISchoolDatabase {
  private tables = new Map<string, any[]>();
  private readonly logger = new Logger(InMemSchoolDatabase.name);

  constructor(public readonly tenantId: string) {
    this.logger.log(`Initialized isolated database instance for tenant: ${tenantId}`);
  }

  private getTable(table: string): any[] {
    if (!this.tables.has(table)) {
      this.tables.set(table, []);
    }
    return this.tables.get(table)!;
  }

  async query<T = any>(table: string, filter?: any): Promise<T[]> {
    const rows = this.getTable(table);
    if (!filter || Object.keys(filter).length === 0) {
      return [...rows] as T[];
    }
    return rows.filter((row) =>
      Object.entries(filter).every(([key, val]) => row[key] === val)
    ) as T[];
  }

  async insert<T = any>(table: string, data: any): Promise<T> {
    const rows = this.getTable(table);
    const id = data.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const record = { ...data, id, createdAt: data.createdAt || now, updatedAt: data.updatedAt || now };
    rows.push(record);
    return record as T;
  }

  async update<T = any>(table: string, filter: any, data: any): Promise<T[]> {
    const rows = this.getTable(table);
    const updatedRecords: T[] = [];
    for (let i = 0; i < rows.length; i++) {
      const match = Object.entries(filter).every(([key, val]) => rows[i][key] === val);
      if (match) {
        rows[i] = { ...rows[i], ...data, updatedAt: new Date().toISOString() };
        updatedRecords.push(rows[i]);
      }
    }
    return updatedRecords;
  }

  async delete(table: string, filter: any): Promise<number> {
    const rows = this.getTable(table);
    const initialLen = rows.length;
    const remaining = rows.filter(
      (row) => !Object.entries(filter).every(([key, val]) => row[key] === val)
    );
    this.tables.set(table, remaining);
    return initialLen - remaining.length;
  }

  async clear(table: string): Promise<void> {
    this.tables.set(table, []);
  }

  getTableData(table: string): any[] {
    return this.getTable(table);
  }
}

@Injectable()
export class TenantConnectionManager {
  private readonly instances = new Map<string, ISchoolDatabase>();
  private readonly logger = new Logger(TenantConnectionManager.name);

  getTenantDatabase(tenantId: string, config?: ITenantConnectionConfig): ISchoolDatabase {
    if (!this.instances.has(tenantId)) {
      this.logger.log(`Creating new database connection for Tenant: ${tenantId}`);
      this.instances.set(tenantId, new InMemSchoolDatabase(tenantId));
    }
    return this.instances.get(tenantId)!;
  }

  removeConnection(tenantId: string): void {
    this.instances.delete(tenantId);
    this.logger.log(`Closed database connection pool for Tenant: ${tenantId}`);
  }
}

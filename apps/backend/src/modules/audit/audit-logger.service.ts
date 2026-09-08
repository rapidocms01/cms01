import { Injectable, Logger } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';

export interface IAuditLogEntry {
  userId: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  timestamp?: string;
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  async log(schoolDb: ISchoolDatabase, entry: IAuditLogEntry): Promise<void> {
    // Sanitize metadata to never log sensitive fields
    const sanitizedMetadata = entry.metadata ? this.sanitize(entry.metadata) : null;

    const record = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: entry.userId,
      userName: entry.userName || 'System User',
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId || null,
      metadata: sanitizedMetadata,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    await schoolDb.insert('audit_logs', record);
    this.logger.log(
      `[AUDIT] Tenant: ${schoolDb.tenantId} | User: ${entry.userId} | Action: ${entry.action} | Resource: ${entry.resource}`,
    );
  }

  private sanitize(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    const sanitized = { ...obj };
    const forbiddenKeys = ['password', 'token', 'secret', 'serviceKey', 'anonKey', 'creditCard'];
    for (const key of Object.keys(sanitized)) {
      if (forbiddenKeys.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }
    return sanitized;
  }
}

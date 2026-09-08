import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Services & Managers
import { SecretCryptoService } from './core/security/secret-crypto.service';
import { CentralDatabaseService } from './database/central-database.service';
import { TenantConnectionManager } from './database/tenant-database.service';
import { TenantResolverService } from './core/tenant/tenant-resolver.service';
import { MultiTenantMigratorService } from './database/multi-tenant-migrator.service';
import { TenantMiddleware } from './core/tenant/tenant.middleware';
import { AuditLoggerService } from './modules/audit/audit-logger.service';

// Controllers
import { PlatformController } from './modules/platform/platform.controller';
import { InstituteController } from './modules/institute/institute.controller';
import { InstituteService } from './modules/institute/institute.service';
import { StudentsController } from './modules/students/students.controller';
import { StudentsService } from './modules/students/students.service';
import { StaffController } from './modules/staff/staff.controller';
import { StaffService } from './modules/staff/staff.service';
import { AttendanceController } from './modules/attendance/attendance.controller';
import { AttendanceService } from './modules/attendance/attendance.service';
import { FinanceController } from './modules/finance/finance.controller';
import { FinanceService } from './modules/finance/finance.service';
import { ExamsController } from './modules/exams/exams.controller';
import { ExamsService } from './modules/exams/exams.service';
import { IdCardsController } from './modules/id-cards/id-cards.controller';
import { IdCardsService } from './modules/id-cards/id-cards.service';
import { IntegrationsController } from './modules/integrations/integrations.controller';
import { IntegrationsService } from './modules/integrations/integrations.service';
import { RbacController } from './modules/rbac/rbac.controller';
import { RbacService } from './modules/rbac/rbac.service';
import { ReportsController } from './modules/reports/reports.controller';
import { ReportsService } from './modules/reports/reports.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.PLATFORM_JWT_SECRET || 'platform_jwt_secret_dev_key',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [
    PlatformController,
    InstituteController,
    StudentsController,
    StaffController,
    AttendanceController,
    FinanceController,
    ExamsController,
    IdCardsController,
    IntegrationsController,
    RbacController,
    ReportsController,
  ],
  providers: [
    SecretCryptoService,
    CentralDatabaseService,
    TenantConnectionManager,
    TenantResolverService,
    MultiTenantMigratorService,
    AuditLoggerService,
    InstituteService,
    StudentsService,
    StaffService,
    AttendanceService,
    FinanceService,
    ExamsService,
    IdCardsService,
    IntegrationsService,
    RbacService,
    ReportsService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}

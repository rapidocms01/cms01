import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { SchoolDb } from '../../core/tenant/tenant-context.decorator';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SubscriptionStatusGuard } from '../../core/tenant/subscription-status.guard';
import { JwtAuthGuard } from '../../core/security/jwt-auth.guard';
import { RbacGuard } from '../../core/security/rbac.guard';
import { RequirePermissions } from '../../core/security/permissions.decorator';
import { Permission } from '@school-cms/common';

@Controller('api/fees')
@UseGuards(JwtAuthGuard, SubscriptionStatusGuard, RbacGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('heads')
  @RequirePermissions(Permission.FEES_VIEW)
  async getHeads(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.financeService.getFeeHeads(db) };
  }

  @Post('heads')
  @RequirePermissions(Permission.FEES_VIEW)
  async createHead(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.financeService.createFeeHead(db, body) };
  }

  @Get('structures')
  @RequirePermissions(Permission.FEES_VIEW)
  async getStructures(@SchoolDb() db: ISchoolDatabase) {
    return { success: true, data: await this.financeService.getFeeStructures(db) };
  }

  @Post('structures')
  @RequirePermissions(Permission.FEES_VIEW)
  async createStructure(@SchoolDb() db: ISchoolDatabase, @Body() body: any) {
    return { success: true, data: await this.financeService.createFeeStructure(db, body) };
  }

  @Post('generate')
  @RequirePermissions(Permission.FEES_VIEW)
  async generateFees(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: { classId: string; monthYear: string; dueDate: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.financeService.generateFees(
      db,
      body.classId,
      body.monthYear,
      body.dueDate,
      userId,
    );
    return { success: true, data };
  }

  @Post('payments')
  @RequirePermissions(Permission.FEES_RECEIVE)
  async receivePayment(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.financeService.receivePayment(db, body, userId);
    return { success: true, data };
  }

  @Get('ledger/:studentId')
  @RequirePermissions(Permission.FEES_VIEW)
  async getLedger(@SchoolDb() db: ISchoolDatabase, @Param('studentId') studentId: string) {
    const data = await this.financeService.getStudentLedger(db, studentId);
    return { success: true, data };
  }

  @Post('adjustments')
  @RequirePermissions(Permission.FEES_ADJUST)
  async addAdjustment(
    @SchoolDb() db: ISchoolDatabase,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.financeService.addAdjustment(db, body, userId);
    return { success: true, data };
  }

  @Get('transactions')
  @RequirePermissions(Permission.FINANCE_VIEW)
  async getTransactions(
    @SchoolDb() db: ISchoolDatabase,
    @Query('type') type: 'income' | 'expense',
  ) {
    const data = await this.financeService.getTransactions(db, type || 'income');
    return { success: true, data };
  }

  @Post('transactions')
  @RequirePermissions(Permission.FINANCE_MANAGE)
  async addTransaction(
    @SchoolDb() db: ISchoolDatabase,
    @Query('type') type: 'income' | 'expense',
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'usr_system';
    const data = await this.financeService.addTransaction(db, type || 'income', body, userId);
    return { success: true, data };
  }
}

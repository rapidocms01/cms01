import { FinanceService } from '../../src/modules/finance/finance.service';
import { AuditLoggerService } from '../../src/modules/audit/audit-logger.service';
import { TenantConnectionManager } from '../../src/database/tenant-database.service';

describe('Finance & Ledger Unit Tests', () => {
  let financeService: FinanceService;
  let auditLogger: AuditLoggerService;
  let connManager: TenantConnectionManager;

  beforeEach(() => {
    auditLogger = new AuditLoggerService();
    financeService = new FinanceService(auditLogger);
    connManager = new TenantConnectionManager();
  });

  test('Receive payment updates student ledger with exact decimal calculations', async () => {
    const db = connManager.getTenantDatabase('test-school-finance');

    // 1. Record Fee Charge Debit
    await db.insert('student_ledgers', {
      studentId: 'STD-100',
      date: '2026-09-01',
      description: 'Tuition Fee Charge',
      debit: 15000.50,
      credit: 0,
    });

    // 2. Receive Payment Credit
    await financeService.receivePayment(
      db,
      {
        studentId: 'STD-100',
        amountPaid: 10000.25,
        paymentDate: '2026-09-05',
        paymentMethod: 'cash',
      },
      'usr_accountant',
    );

    // 3. Verify Ledger Balance
    const ledgerResult = await financeService.getStudentLedger(db, 'STD-100');
    expect(ledgerResult.currentBalance).toEqual(5000.25); // 15000.50 - 10000.25 = 5000.25
  });
});

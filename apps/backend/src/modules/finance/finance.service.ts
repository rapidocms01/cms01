import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { AuditLoggerService } from '../audit/audit-logger.service';

@Injectable()
export class FinanceService {
  constructor(private readonly auditLogger: AuditLoggerService) {}

  // Helper for exact decimal currency arithmetic (cents conversion)
  private toCents(amount: number): number {
    return Math.round((Number(amount) || 0) * 100);
  }

  private fromCents(cents: number): number {
    return Number((cents / 100).toFixed(2));
  }

  // 1. Fee Heads
  async getFeeHeads(db: ISchoolDatabase) {
    let heads = await db.query('fee_heads');
    if (heads.length === 0) {
      heads = [
        await db.insert('fee_heads', { name: 'Tuition Fee', code: 'TUT', isRecurring: true }),
        await db.insert('fee_heads', { name: 'Admission Fee', code: 'ADM', isRecurring: false }),
        await db.insert('fee_heads', { name: 'Examination Fee', code: 'EXM', isRecurring: false }),
        await db.insert('fee_heads', { name: 'Transport Fee', code: 'TRN', isRecurring: true }),
      ];
    }
    return heads;
  }

  async createFeeHead(db: ISchoolDatabase, data: any) {
    return await db.insert('fee_heads', data);
  }

  // 2. Fee Structures
  async getFeeStructures(db: ISchoolDatabase) {
    return await db.query('fee_structures');
  }

  async createFeeStructure(db: ISchoolDatabase, data: any) {
    return await db.insert('fee_structures', {
      ...data,
      amount: this.fromCents(this.toCents(data.amount)),
    });
  }

  // 3. Fee Generation
  async generateFees(
    db: ISchoolDatabase,
    classId: string,
    monthYear: string, // YYYY-MM
    dueDate: string,
    userId: string,
  ) {
    const students = await db.query('students', { classId, status: 'active' });
    if (students.length === 0) {
      throw new BadRequestException('No active students found in selected class');
    }

    const feeStructures = await db.query('fee_structures', { classId });
    if (feeStructures.length === 0) {
      throw new BadRequestException('No fee structure configured for selected class');
    }

    const generatedCharges = [];

    for (const student of students) {
      for (const structure of feeStructures) {
        // Prevent duplicate fee generation
        const existing = await db.query('student_charges', {
          studentId: student.id,
          feeHeadId: structure.feeHeadId,
          monthYear,
        });

        if (existing.length === 0) {
          const charge = await db.insert('student_charges', {
            studentId: student.id,
            feeHeadId: structure.feeHeadId,
            amount: structure.amount,
            dueDate,
            monthYear,
            status: 'unpaid',
          });
          generatedCharges.push(charge);

          // Record Debit entry in Student Ledger
          await db.insert('student_ledgers', {
            studentId: student.id,
            date: new Date().toISOString().split('T')[0],
            description: `Fee Generation (${monthYear})`,
            debit: structure.amount,
            credit: 0,
            referenceType: 'charge',
            referenceId: charge.id,
          });
        }
      }
    }

    await this.auditLogger.log(db, {
      userId,
      action: 'FEE_GENERATION',
      resource: 'student_charges',
      metadata: { classId, monthYear, count: generatedCharges.length },
    });

    return { generatedCount: generatedCharges.length, charges: generatedCharges };
  }

  // 4. Receive Payment
  async receivePayment(
    db: ISchoolDatabase,
    data: {
      studentId: string;
      amountPaid: number;
      paymentDate: string;
      paymentMethod: string;
      referenceNumber?: string;
      notes?: string;
      chargeIds?: string[];
    },
    userId: string,
  ) {
    const paidCents = this.toCents(data.amountPaid);
    if (paidCents <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const existingPayments = await db.query('payments');
    const receiptNumber = `REC-${new Date().getFullYear()}-${1000 + existingPayments.length + 1}`;

    const payment = await db.insert('payments', {
      receiptNumber,
      studentId: data.studentId,
      amountPaid: this.fromCents(paidCents),
      paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'cash',
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
      receivedByUserId: userId,
    });

    // Update Student Charges Status (allocating payment to unpaid charges)
    let remainingPaidCents = paidCents;
    const studentCharges = await db.query('student_charges', {
      studentId: data.studentId,
    });

    // Filter unpaid / partial charges
    const openCharges = studentCharges.filter((c) => c.status !== 'paid');

    for (const charge of openCharges) {
      if (remainingPaidCents <= 0) break;
      const chargeCents = this.toCents(charge.amount);

      if (remainingPaidCents >= chargeCents) {
        await db.update('student_charges', { id: charge.id }, { status: 'paid' });
        remainingPaidCents -= chargeCents;
      } else {
        await db.update('student_charges', { id: charge.id }, { status: 'partial' });
        remainingPaidCents = 0;
      }
    }

    // Record Credit entry in Student Ledger
    await db.insert('student_ledgers', {
      studentId: data.studentId,
      date: payment.paymentDate,
      description: `Payment Received (Receipt #${receiptNumber})`,
      debit: 0,
      credit: payment.amountPaid,
      referenceType: 'payment',
      referenceId: payment.id,
    });

    await this.auditLogger.log(db, {
      userId,
      action: 'PAYMENT_RECEIVED',
      resource: 'payments',
      resourceId: payment.id,
      metadata: { receiptNumber, amountPaid: payment.amountPaid, studentId: data.studentId },
    });

    return payment;
  }

  // 5. Student Ledger Engine
  async getStudentLedger(db: ISchoolDatabase, studentId: string) {
    const entries = await db.query('student_ledgers', { studentId });

    // Sort chronologically
    entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let runningBalanceCents = 0;
    const ledger = entries.map((entry) => {
      const debitCents = this.toCents(entry.debit);
      const creditCents = this.toCents(entry.credit);
      runningBalanceCents = runningBalanceCents + debitCents - creditCents;

      return {
        ...entry,
        debit: this.fromCents(debitCents),
        credit: this.fromCents(creditCents),
        balance: this.fromCents(runningBalanceCents),
      };
    });

    return {
      studentId,
      currentBalance: this.fromCents(runningBalanceCents),
      ledger,
    };
  }

  // 6. Financial Adjustments & Discounts
  async addAdjustment(
    db: ISchoolDatabase,
    data: {
      studentId: string;
      type: 'discount' | 'charge_reversal' | 'penalty';
      amount: number;
      reason: string;
    },
    userId: string,
  ) {
    const amountCents = this.toCents(data.amount);
    const formattedAmount = this.fromCents(amountCents);

    const isCredit = data.type === 'discount' || data.type === 'charge_reversal';

    const adjustment = await db.insert('financial_adjustments', {
      studentId: data.studentId,
      type: data.type,
      amount: formattedAmount,
      reason: data.reason,
      approvedByUserId: userId,
    });

    await db.insert('student_ledgers', {
      studentId: data.studentId,
      date: new Date().toISOString().split('T')[0],
      description: `Adjustment: ${data.type.replace('_', ' ').toUpperCase()} - ${data.reason}`,
      debit: isCredit ? 0 : formattedAmount,
      credit: isCredit ? formattedAmount : 0,
      referenceType: 'adjustment',
      referenceId: adjustment.id,
    });

    await this.auditLogger.log(db, {
      userId,
      action: 'FINANCIAL_ADJUSTMENT',
      resource: 'financial_adjustments',
      resourceId: adjustment.id,
      metadata: data,
    });

    return adjustment;
  }

  // 7. Income & Expenses
  async getTransactions(db: ISchoolDatabase, type: 'income' | 'expense') {
    const table = type === 'income' ? 'income_transactions' : 'expense_transactions';
    return await db.query(table);
  }

  async addTransaction(db: ISchoolDatabase, type: 'income' | 'expense', data: any, userId: string) {
    const table = type === 'income' ? 'income_transactions' : 'expense_transactions';
    const record = await db.insert(table, {
      ...data,
      amount: this.fromCents(this.toCents(data.amount)),
      createdByUserId: userId,
    });
    return record;
  }
}

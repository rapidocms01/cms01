export interface IAcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'active' | 'archived';
}

export interface IClass {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface ISection {
  id: string;
  classId: string;
  name: string;
  capacity?: number;
}

export interface ISubject {
  id: string;
  name: string;
  code?: string;
  type?: 'theory' | 'practical' | 'both';
}

export interface IStudent {
  id: string;
  studentIdNumber: string;
  admissionNumber: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  photoUrl?: string | null;
  bFormCnic?: string | null;
  phone?: string | null;
  address?: string | null;
  
  // Guardian
  guardianName: string;
  guardianRelation: string;
  guardianCnic?: string | null;
  guardianPhone: string;
  guardianWhatsapp?: string | null;
  guardianEmail?: string | null;
  
  // Academic
  academicSessionId: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'transferred' | 'withdrawn' | 'graduated';
  
  previousSchool?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IStaff {
  id: string;
  staffIdNumber: string;
  fullName: string;
  photoUrl?: string | null;
  cnic?: string | null;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  phone: string;
  email: string;
  address?: string | null;
  designation: string;
  category: 'teacher' | 'principal' | 'accountant' | 'administration' | 'support' | string;
  joiningDate: string;
  employmentStatus: 'active' | 'on_leave' | 'resigned' | 'terminated';
  salary?: number | null;
  emergencyContact?: string | null;
  portalAccessEnabled: boolean;
  roleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceRecord {
  id: string;
  entityType: 'student' | 'staff';
  entityId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  remarks?: string | null;
  classId?: string;
  sectionId?: string;
  markedByUserId?: string;
}

export interface IFeeHead {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isRecurring: boolean;
}

export interface IFeeStructure {
  id: string;
  name: string;
  academicSessionId: string;
  classId: string;
  amount: number;
  dueDate: string;
  feeHeadId: string;
}

export interface IStudentCharge {
  id: string;
  studentId: string;
  feeHeadId: string;
  amount: number;
  dueDate: string;
  monthYear?: string;
  status: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
}

export interface IPayment {
  id: string;
  receiptNumber: string;
  studentId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online' | string;
  referenceNumber?: string | null;
  notes?: string | null;
  receivedByUserId: string;
  createdAt: string;
}

export interface IStudentLedgerEntry {
  id: string;
  studentId: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  referenceType?: 'charge' | 'payment' | 'discount' | 'adjustment';
  referenceId?: string;
}

export interface IExam {
  id: string;
  name: string;
  academicSessionId: string;
  classId: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'open' | 'marks_entry' | 'under_review' | 'published' | 'archived';
}

export interface IMarksEntry {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number | null;
  isAbsent: boolean;
  maxMarks: number;
  passingMarks: number;
  enteredByUserId: string;
}

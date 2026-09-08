import { SecretCryptoService } from '../../src/core/security/secret-crypto.service';
import { CentralDatabaseService } from '../../src/database/central-database.service';
import { TenantConnectionManager } from '../../src/database/tenant-database.service';
import { SubscriptionStatus, Permission } from '@school-cms/common';

describe('Tenant Isolation & Crypto Unit Tests', () => {
  let cryptoService: SecretCryptoService;
  let centralDb: CentralDatabaseService;
  let connManager: TenantConnectionManager;

  beforeEach(() => {
    cryptoService = new SecretCryptoService();
    centralDb = new CentralDatabaseService(cryptoService);
    connManager = new TenantConnectionManager();
  });

  test('AES-256-GCM secret encryption and decryption', () => {
    const plainSecret = 'supabase_service_role_key_super_secret_123';
    const encrypted = cryptoService.encrypt(plainSecret);
    expect(encrypted).not.toEqual(plainSecret);
    expect(encrypted).toContain(':');

    const decrypted = cryptoService.decrypt(encrypted);
    expect(decrypted).toEqual(plainSecret);
  });

  test('Central DB retrieves tenant by subdomain', async () => {
    const tenant = await centralDb.findTenantBySubdomain('greenwood');
    expect(tenant).not.toBeNull();
    expect(tenant?.id).toEqual('tenant-school-a');
    expect(tenant?.subscriptionStatus).toEqual(SubscriptionStatus.ACTIVE);
  });

  test('Tenant databases are strictly isolated per tenant ID', async () => {
    const dbSchoolA = connManager.getTenantDatabase('school-a');
    const dbSchoolB = connManager.getTenantDatabase('school-b');

    await dbSchoolA.insert('students', { fullName: 'Student in School A' });
    await dbSchoolB.insert('students', { fullName: 'Student in School B' });

    const studentsA = await dbSchoolA.query('students');
    const studentsB = await dbSchoolB.query('students');

    expect(studentsA.length).toBe(1);
    expect(studentsA[0].fullName).toBe('Student in School A');

    expect(studentsB.length).toBe(1);
    expect(studentsB[0].fullName).toBe('Student in School B');

    // Confirm School A data never leaks into School B
    expect(studentsB[0].fullName).not.toBe('Student in School A');
  });
});

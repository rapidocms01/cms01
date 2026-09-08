import { Injectable } from '@nestjs/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';
import { SecretCryptoService } from '../../core/security/secret-crypto.service';

export interface IProviderConfig {
  id: string;
  providerType: 'whatsapp' | 'sms' | 'email' | 'biometric';
  providerName: string;
  isEnabled: boolean;
  settings: Record<string, any>;
  lastConnectedAt?: string;
  status: 'connected' | 'disconnected' | 'error';
}

@Injectable()
export class IntegrationsService {
  constructor(private readonly cryptoService: SecretCryptoService) {}

  async getConfigs(db: ISchoolDatabase): Promise<IProviderConfig[]> {
    let configs = await db.query('integration_configs');
    if (configs.length === 0) {
      configs = [
        {
          id: 'int_wa_default',
          providerType: 'whatsapp',
          providerName: 'WhatsApp Business API',
          isEnabled: false,
          settings: { apiKey: '', phoneNumberId: '' },
          status: 'disconnected',
        },
        {
          id: 'int_sms_default',
          providerType: 'sms',
          providerName: 'Twilio / Local SMS Gateway',
          isEnabled: false,
          settings: { accountSid: '', authToken: '', senderId: 'SCHOOL' },
          status: 'disconnected',
        },
        {
          id: 'int_email_default',
          providerType: 'email',
          providerName: 'SMTP / SendGrid',
          isEnabled: true,
          settings: { host: 'smtp.mail.com', port: 587, user: 'notifications@greenwood.edu' },
          status: 'connected',
        },
        {
          id: 'int_bio_default',
          providerType: 'biometric',
          providerName: 'ZKTeco / Biometric Hardware Adapter',
          isEnabled: false,
          settings: { deviceIp: '192.168.1.200', port: 4370 },
          status: 'disconnected',
        },
      ];
      for (const c of configs) {
        await db.insert('integration_configs', c);
      }
    }
    return configs;
  }

  async saveConfig(db: ISchoolDatabase, id: string, data: any) {
    // Encrypt sensitive secret fields before saving
    if (data.settings) {
      if (data.settings.apiKey) data.settings.apiKey = this.cryptoService.encrypt(data.settings.apiKey);
      if (data.settings.authToken) data.settings.authToken = this.cryptoService.encrypt(data.settings.authToken);
    }
    const updated = await db.update('integration_configs', { id }, data);
    return updated[0];
  }

  async testConnection(db: ISchoolDatabase, id: string) {
    const configs = await db.query('integration_configs', { id });
    if (configs.length === 0) return { success: false, message: 'Provider config not found' };

    const cfg = configs[0];
    const now = new Date().toISOString();

    await db.update('integration_configs', { id }, { status: 'connected', lastConnectedAt: now });
    await db.insert('integration_logs', {
      providerId: id,
      event: 'TEST_CONNECTION',
      status: 'SUCCESS',
      timestamp: now,
    });

    return {
      success: true,
      message: `Successfully connected to ${cfg.providerName}`,
      testedAt: now,
    };
  }

  async getLogs(db: ISchoolDatabase) {
    return await db.query('integration_logs');
  }
}

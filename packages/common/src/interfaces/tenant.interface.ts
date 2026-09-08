import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface ITenant {
  id: string;
  instituteName: string;
  instituteLogo?: string | null;
  subdomain: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  ownerWhatsapp?: string | null;
  accountStatus: SubscriptionStatus;
  subscriptionStatus: SubscriptionStatus;
  trialStart?: string | null;
  trialEnd?: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITenantConnectionConfig {
  tenantId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string; // Server-side only! Encrypted at rest.
  dbConnectionString?: string;
}

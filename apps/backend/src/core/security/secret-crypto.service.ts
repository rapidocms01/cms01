import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SecretCryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor() {
    const rawKey = process.env.TENANT_SECRET_ENCRYPTION_KEY || 'default_super_secret_key_32bytes!!';
    // Ensure key length is exactly 32 bytes for aes-256
    this.secretKey = crypto.createHash('sha256').update(rawKey).digest();
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(cipherText: string): string {
    if (!cipherText || !cipherText.includes(':')) {
      return cipherText; // Return as-is if unencrypted fallback
    }
    const [ivHex, authTagHex, encryptedText] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

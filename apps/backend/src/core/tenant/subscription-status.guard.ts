import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionStatus } from '@school-cms/common';

@Injectable()
export class SubscriptionStatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenant = request.tenant;

    if (!tenant) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TENANT_NOT_FOUND',
            message: 'Unable to resolve tenant for request context.',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const lockedStatuses = [
      SubscriptionStatus.SUSPENDED,
      SubscriptionStatus.EXPIRED,
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.BLOCKED,
    ];

    if (lockedStatuses.includes(tenant.subscriptionStatus)) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'SUBSCRIPTION_LOCKED',
            message: `Tenant CMS access is locked. Current account status: ${tenant.subscriptionStatus}`,
            details: {
              tenantId: tenant.id,
              status: tenant.subscriptionStatus,
            },
          },
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }
}

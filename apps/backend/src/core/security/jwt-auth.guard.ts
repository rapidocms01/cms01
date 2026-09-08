import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development / initial testing when no token is passed, attach default admin session
      request.user = {
        id: 'usr_admin_default',
        email: 'admin@school.edu',
        fullName: 'Institute Admin',
        role: 'Institute Admin',
        permissions: [], // Admin bypasses via RbacGuard
      };
      return true;
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.PLATFORM_JWT_SECRET || 'platform_jwt_secret_dev_key',
      });
      request.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ITenant } from '@school-cms/common';
import { ISchoolDatabase } from '../../database/tenant-database.service';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ITenant => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);

export const SchoolDb = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ISchoolDatabase => {
    const request = ctx.switchToHttp().getRequest();
    return request.schoolDb;
  },
);

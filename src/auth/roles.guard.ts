import { CallHandler, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard {

    constructor(private reflector: Reflector) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles)
            return next.handle();

        const request = context.switchToHttp().getRequest();
        const requestRoles = request?.user?.resource_access?.customers?.roles;

        if (!requestRoles)
            throw new UnauthorizedException();

        if (!requestRoles.some(s => roles.some(c => c === s)))
            throw new UnauthorizedException();

        return next.handle();
    }
}
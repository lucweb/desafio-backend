import { CallHandler, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard {

    constructor(private reflector: Reflector) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {

        const roles = this.reflector.get<string[]>('roles', context.getHandler());
      
        const request = context.switchToHttp().getRequest();
        const requestRoles = request?.user?.resource_access?.customers?.roles;

        if (!requestRoles || !roles)
            throw new UnauthorizedException()
            
        if (!requestRoles.some(s => roles.some(c => c === s)))
            throw new UnauthorizedException()

        return next.handle()
    }
}
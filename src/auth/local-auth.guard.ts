import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAuthGuard implements CanActivate {

    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const signedJwtAccessToken = request?.headers?.authorization;

        if (!signedJwtAccessToken)
            throw new UnauthorizedException();

        request.user = await this.authService.getUserValidate(request.headers.authorization)

        if (!request.user)
            throw new UnauthorizedException();

        return true;
    }
}
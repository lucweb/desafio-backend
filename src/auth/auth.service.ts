import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from './auth.dto';
import { InjectRedisClient } from 'nestjs-ioredis';
import * as Redis from 'ioredis';
import { AxiosService } from '../services/axios.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly axios: AxiosService,
        private readonly jwtService: JwtService,
        @InjectRedisClient('REDIS_CLIENT') private redisClient: Redis.Redis,
    ) { }

    async getUserValidate(signedJwtAccessToken: string): Promise<AuthUser> {
        const cleanToken = signedJwtAccessToken.replace('Bearer', '').trim();
        const authUser = this.jwtService.decode(cleanToken) as AuthUser
        
        if (!authUser)
            throw new UnauthorizedException();

        /** Subtracts the current date from the expiration date, and returns the rounded value. */
        const expires_in = Math.round(((authUser.exp * 1000) - new Date().getTime()) / 1000);

        if (expires_in < 0)
            throw new UnauthorizedException();

        if (['close', 'reconnecting', 'end', 'connecting'].some(c => c == this.redisClient.status))
            throw new HttpException({
                statusCode: HttpStatus.BAD_GATEWAY,
                message: 'Cache indisponível',
            }, HttpStatus.BAD_GATEWAY);

        const keyRedis = `${authUser.clientId}-${authUser.exp}-${authUser.iat}`
        const preferredUsername = await this.redisClient.get(keyRedis);

        if (preferredUsername !== authUser.preferred_username) {
            const isValidToken = await this.validateAccess(cleanToken);

            if (isValidToken)
                this.redisClient.set(keyRedis, authUser.preferred_username, 'EX', expires_in);
        }
        return authUser;
    }

    async validateAccess(cleanToken: string): Promise<boolean> {
        const data = await this.findUserAuth(cleanToken)
        if (typeof (data?.active) != 'boolean')
            throw new HttpException({
                statusCode: HttpStatus.BAD_GATEWAY,
                message: 'SSO indisponível',
            }, HttpStatus.BAD_GATEWAY);
        return data?.active
    }

    async findUserAuth(cleanToken: string): Promise<AuthUser> {
        const url = `${process.env.KEY_CLOAK_CAREERS_HOST}protocol/openid-connect/token/introspect`;
        const data = {
            client_secret: process.env.KEY_CLOAK_CAREERS_CLIENT_SECRET,
            client_id: process.env.KEY_CLOAK_CAREERS_CLIENT_ID,
            token: cleanToken
        };
        const response = await this.axios.asyncPost(url, data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response as AuthUser;
    }
}
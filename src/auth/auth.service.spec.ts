import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { AxiosService } from '../services/axios.service';
import { HttpModule } from '@nestjs/axios';
import { GlobalClientsRedisModule } from '../global-clients-redis.module';


describe('AuthService', () => {
    let authService: AuthService;
    let axiosService: AxiosService;
    let tokenKeyCloakSSO: string

    const getTokenKeyCloakSSO = async () => {
        const url = `${process.env.KEY_CLOAK_CAREERS_HOST}protocol/openid-connect/token`;
        const data = {
            client_secret: process.env.KEY_CLOAK_CAREERS_CLIENT_SECRET,
            client_id: process.env.KEY_CLOAK_CAREERS_CLIENT_ID,
            scope: process.env.KEY_CLOAK_CAREERS_SCOPE,
            username: process.env.KEY_CLOAK_CAREERS_USERNAME,
            password: process.env.KEY_CLOAK_CAREERS_PASSWORD,
            grant_type: process.env.KEY_CLOAK_CAREERS_GRANT_TYPE,
        };
        const response = await axiosService.asyncPost(url, data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }) as { "access_token": string };
        return response?.access_token;
    }

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            providers: [
                LocalAuthGuard, AuthService, AxiosService, JwtService
            ],
            imports: [
                HttpModule,
                GlobalClientsRedisModule,
            ]
        }).compile();

        authService = app.get<AuthService>(AuthService);
        axiosService = app.get<AxiosService>(AxiosService);

        tokenKeyCloakSSO = await getTokenKeyCloakSSO();
    });

    describe('Testing authentication services', () => {

        it('Should return code 401 without authorization, reason token expired', async () => {
            const tokenMock = `eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyTGYtamFReXZmQTNCN3dpVHZ3VkxhMjV1cHhiXzUtQ
            XhZSDhmY3kySHhVIn0.eyJleHAiOjE2ODk1MzE4MDEsImlhdCI6MTY4OTUzMTUwMSwianRpIjoiZjk3M2NlMTYtZDY2MC00MzcyLTkyNzEtNmY2ZTF
            hYTYyN2RjIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5zZWd1cm9zLnZpdHRhLmNvbS5ici9hdXRoL3JlYWxtcy9jYXJlZXJzIiwic3ViIjoiNzk0Zm
            FkNjktMzkxNy00OThmLThhNjUtMWVjZGU5NjlmMGRiIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiY3VzdG9tZXJzIiwiYWNyIjoiMSIsInJlc291cm
            NlX2FjY2VzcyI6eyJjdXN0b21lcnMiOnsicm9sZXMiOlsidXNlciJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJjbGllbnRJZCI
            6ImN1c3RvbWVycyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiY2xpZW50SG9zdCI6IjEwLjUwLjMuMTUxIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic
            2VydmljZS1hY2NvdW50LWN1c3RvbWVycyIsImNsaWVudEFkZHJlc3MiOiIxMC41MC4zLjE1MSJ9.MTsUYI-1o1OEAXzNDzWy8JLR-WgTqanxUASjsVSr
            fq20PpZQFNJjwXbTo5XqY5w1o8_NwhlUWl7LoM-Z1W2hN4zrm3imuU_VSe8fBXODSPx64twYEYMgOvAKIlAWzAzyg7hspBnmQmh9zow7tfwDAJaBWTfyl
            y9ZmoNY2kFSRHtX2xpVMeqZD3fp2HXPbldbMbRvoWbfwuw49ctKJco8HwcdQ3NXoZiPDGe5_kwKoLzHu-BsVkJXK2uXH8h1EjPzI0mbQWFaTxhQ9P9pJxB-
            Na0wvXIAk7nFfBYjs2p0mdB2XgCi1cd_5nO0O2d6bWCGcoO9_QF0K2w1oE9iYP0feA`
            try {
                await authService.getUserValidate(tokenMock);
            } catch (error) {
                expect(error.response).toEqual({ message: 'Unauthorized', statusCode: 401 });
            }
        });

        it('Should return code 401 without authorization, reason token invalid', async () => {
            const tokenMock = "hXxMC41MC4zLjE1MSJ9.MTs"
            try {
                await authService.getUserValidate(tokenMock);
            } catch (error) {
                expect(error.response).toEqual({ message: 'Unauthorized', statusCode: 401 });
            }
        });

        it('Should return code 401 without authorization, reason token undefined', async () => {
            try {
                await authService.getUserValidate(null);
                expect(false)
            } catch (error) {
                expect(error.response).toEqual({ message: 'Unauthorized', statusCode: 401 });
            }
        });

        it('Must return a valid string when searching for the mantle key token (SSO)', async () => {
            const isValidToken = (tokenKeyCloakSSO || '').length > 0
            expect(isValidToken).toEqual(true)
        });

        it('Must return the user', async () => {
            const user = await authService.getUserValidate(tokenKeyCloakSSO);
            expect(user.clientId).toEqual(process.env.KEY_CLOAK_CAREERS_CLIENT_ID);
        });
    });
});

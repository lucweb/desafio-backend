import { Module } from '@nestjs/common';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.service';
import { GlobalClientsRedisModule } from '.././../global-clients-redis.module';
import { AuthService } from '../../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AxiosService } from '../../services/axios.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [       
        HttpModule,
        GlobalClientsRedisModule,
    ],
    controllers: [ClientController],
    providers: [ClientService, AxiosService, JwtService, AuthService]
})
export class ClientModule { }

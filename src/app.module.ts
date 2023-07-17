import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { GlobalClientsRedisModule } from './global-clients-redis.module';
import { HttpModule } from '@nestjs/axios';
import { AxiosService } from './services/axios.service';
import { ClientModule } from './modules/client/client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientModule,
    HttpModule
  ],
  controllers: [AppController],
  providers: [JwtService, AuthService, AxiosService]
})
export class AppModule { }

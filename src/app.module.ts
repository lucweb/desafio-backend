import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { GlobalClientsRedisModule } from './global-clients-redis.module';
import { HttpModule } from '@nestjs/axios';
import { AxiosService } from './services/axios.service';
import { ClientModule } from './modules/client/client.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientModule,
    HttpModule
  ],
  controllers: [AppController],
  providers: [
    JwtService, 
    AuthService, 
    AxiosService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RolesGuard
    },
  ],

})
export class AppModule { }

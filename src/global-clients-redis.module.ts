import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "nestjs-ioredis";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),    
    RedisModule.forRoot([
      {
        name: 'REDIS_CLIENT',
        host: process.env.REDIS_CLIENT_HOST,
        port: Number(process.env.REDIS_CLIENT_PORT),
        password: process.env.REDIS_CLIENT_PASSWORD
       }
    ])
  ],
})
export class GlobalClientsRedisModule {}
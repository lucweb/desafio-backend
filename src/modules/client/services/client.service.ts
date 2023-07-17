import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';
import { InjectRedisClient } from 'nestjs-ioredis';
import { Client } from '../entity/client.entity';

@Injectable()
export class ClientService {
  constructor(@InjectRedisClient('REDIS_CLIENT') private redisClient: Redis.Redis) {
   }

  async findById(id: string): Promise<Client> {
    const model = await this.redisClient.get(id);
    return model ? JSON.parse(model) : null;
  }

  async save(model: Client): Promise<any> {
    const response = await this.redisClient.set(model.id, JSON.stringify(model));
    return response == 'OK' ? model : null
  }

  async update(model: Client): Promise<Client> {
    const client = await this.findById(model.id)
    if (!client)
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: 'Cliente inexistente',
      }, HttpStatus.NOT_FOUND);

    return await this.save(model);
  }
}

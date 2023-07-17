import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ClientController } from './client.controller';
import { ClientService } from '../services/client.service';
import { LocalAuthGuard } from '../../../auth/local-auth.guard';
import { AuthService } from '../../../auth/auth.service';
import { AxiosService } from '../../../services/axios.service';
import { HttpModule } from '@nestjs/axios';
import { GlobalClientsRedisModule } from '../../../global-clients-redis.module';
import { ClientDTO } from '../dto/client.dto';


import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../../app.module';




describe('ClientController', () => {
  let clientController: ClientController;

  beforeEach(async () => {

    const app: TestingModule = await Test.createTestingModule({

      controllers: [ClientController],
      providers: [
        LocalAuthGuard, AuthService, AxiosService, JwtService, ClientService
      ],
      imports: [
        HttpModule,
        GlobalClientsRedisModule,
      ]
    }).compile();

    clientController = app.get<ClientController>(ClientController);
  });

  describe('root', () => {

    const requestClientPost: ClientDTO = {
      id: String(),
      name: `Hello Word - ${new Date().toISOString()}`,
      document: 1
    };

    it('Need to create a user', async () => {
      const responseClientPost = await clientController.create(requestClientPost);
      requestClientPost.id = responseClientPost.id;
      expect(requestClientPost).toEqual(responseClientPost);
    });
    
    
  });

  describe('ClientControllerValidate', () => {
    let appHttp: INestApplication;
  
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      appHttp = moduleFixture.createNestApplication();
      await appHttp.init();
    });
  
    it('/ (GET)', () => {
      return request(appHttp.getHttpServer())
        .get(`/customers/61f6116d-da47-44a8-9e96-0e448081f79e`)
        .expect(401)
        .expect({
          "message": "Unauthorized",
          "statusCode": 401
        });
    });
  });
});

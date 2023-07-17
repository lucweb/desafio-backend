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
  let axiosService: AxiosService;
  let clientService: ClientService;

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
    axiosService = app.get<AxiosService>(AxiosService);
    clientService = app.get<ClientService>(ClientService);
  });

  describe('Conventional service control test', () => {
    const requestDataClient: ClientDTO = {
      id: String(),
      name: `Test Cretead`,
      document: 1
    };

    it('Need to create a client', async () => {
      const responseClientPost = await clientController.create(requestDataClient);
      requestDataClient.id = responseClientPost.id;
      expect(requestDataClient).toEqual(responseClientPost);
    });

    it('Need to search for client by id', async () => {
      const responseClient = await clientController.get(requestDataClient.id);
      expect(responseClient).toEqual(requestDataClient);
    });

    it('Need to update a client', async () => {
      requestDataClient.name = 'Test Updated';
      requestDataClient.document = 2;
      const responseClientPut = await clientController.update(requestDataClient);
      expect(responseClientPut).toEqual(requestDataClient);
    });

    it('Need to search customer by id and name must be same as edited name', async () => {
      const responseClient = await clientController.get(requestDataClient.id);
      clientService.delete(requestDataClient.id);
      expect(responseClient).toEqual(requestDataClient);
    });
  });

  describe('ClientControllerValidate', () => {

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

    let tokenKeyCloakSSO: string
    let appHttp: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      appHttp = moduleFixture.createNestApplication();
      await appHttp.init();

      tokenKeyCloakSSO = await getTokenKeyCloakSSO();
    });

    /** start access validation test / GET, POST, PUT */
    it('Customers /GET: Should return 401 status and unauthorized access message', () => {
      return request(appHttp.getHttpServer())
        .get(`/customers/uuidV4`)
        .expect(401)
        .expect({
          message: 'Unauthorized',
          statusCode: 401
        });
    });

    it('Customers /POST: Should return 401 status and unauthorized access message', () => {
      return request(appHttp.getHttpServer())
        .post(`/customers`)
        .expect(401)
        .expect({
          message: 'Unauthorized',
          statusCode: 401
        });
    });

    it('Customers /PUT: Should return 401 status and unauthorized access message', () => {
      return request(appHttp.getHttpServer())
        .put(`/customers`)
        .expect(401)
        .expect({
          message: 'Unauthorized',
          statusCode: 401
        });
    });

    
    /** start data validation test / Token (SSO) */
    it('It must return a valid string when searching for the mantle key token (SSO)', async () => {
      const isValidToken = (tokenKeyCloakSSO || '').length > 0
      expect(isValidToken).toEqual(true)
    });

    /** start data validation test / GET */
    it('Customers /GET: Should return the non-existent customer message, (validates search with invalid id)', () => {
      return request(appHttp.getHttpServer())
        .get(`/customers/uuidV4`)
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Cliente inexistente'
        });
    });

    it('Customers /GET: Should return 404, not Found', () => {
      return request(appHttp.getHttpServer())
        .get(`/customers`)
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(404)
        .expect({
          message: 'Cannot GET /customers',
          error: 'Not Found',
          statusCode: 404
        });
    });

    /** start data validation test / POST */
    it('Customers /POST: Should return status 400 and error Bad Request "array message": Name is required and document number is required', () => {
      return request(appHttp.getHttpServer())
        .post(`/customers`)
        .send({
          name: ""
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(400)
        .expect({
          message: ['Submit a valid name', 'Document number is required'],
          error: 'Bad Request',
          statusCode: 400
        });
    });

    it('Customers /POST: Should return status 400 and error Bad Request "array message": document number is required', () => {
      return request(appHttp.getHttpServer())
        .post(`/customers`)
        .send({
          name: "Name client"
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(400)
        .expect({
          message: ['Document number is required'],
          error: 'Bad Request',
          statusCode: 400
        });
    });

    it('Customers /POST: Should return status 400 and error Bad Request (document as string, name as Number) "array message": Name is required and document number is required', () => {
      return request(appHttp.getHttpServer())
        .post(`/customers`)
        .send({
          name: 0,
          document: "..."
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(400)
        .expect({
          message: ['Name is required', 'Submit a valid name', 'Document number is required'],
          error: 'Bad Request',
          statusCode: 400
        });
    });

    /** start data validation test / PUT */
    it('Customers /PUT: Should return status 400 and error Bad Request "array message": Name is required and document number is required', () => {
      return request(appHttp.getHttpServer())
        .put(`/customers`)
        .send({
          name: ""
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(400)
        .expect({
          message: ['Id must be a UUID v4', 'Submit a valid name', 'Document number is required'],
          error: 'Bad Request',
          statusCode: 400
        });
    });

    it('Customers /PUT: Should return status 400 and error Bad Request "array message": document number is required', () => {
      return request(appHttp.getHttpServer())
        .put(`/customers`)
        .send({
          name: "Name client"
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(400)
        .expect({
          message: ['Id must be a UUID v4', 'Document number is required'],
          error: 'Bad Request',
          statusCode: 400
        });
    });

    it('Customers /PUT: Should return status 400 and error Bad Request (document as string, name as Number) "array message": Name is required and document number is required', () => {
      return request(appHttp.getHttpServer())
        .put(`/customers`)
        .send({
          name: 0,
          document: "..."
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(400)
        .expect({
          message: ['Id must be a UUID v4', 'Name is required', 'Submit a valid name', 'Document number is required'],
          error: 'Bad Request',
          statusCode: 400
        });
    });

    it('Customers /PUT: Must return status 400 and return message Id must be a UUID v4', () => {
      return request(appHttp.getHttpServer())
        .put(`/customers`)
        .send({
          id: "165e4661-fa5sDf6465465-sd6fa65f-98498",
          name: "Name update",
          document: 50
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(400)
        .expect({
          message: ['Id must be a UUID v4'],
          error: 'Bad Request',
          statusCode: 400
        });
    });

    it('Customers /PUT: Must return status 400 and return message Id must be a UUID v4', () => {
      return request(appHttp.getHttpServer())
        .put(`/customers`)
        .send({
          id: "aaf68028-119a-4d2e-92bf-b1697827f07b",
          name: "Name update",
          document: 50
        })
        .set('Authorization', `Bearer ${tokenKeyCloakSSO}`)
        .expect(404)
        .expect({ 
          statusCode: 404, 
          message: 'Cliente inexistente' 
        });
    });
  });
});

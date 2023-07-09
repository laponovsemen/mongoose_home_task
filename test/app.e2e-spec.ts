import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from './../src/app.module';
import request from "supertest";
import cookieParser from "cookie-parser";

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server : any
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser())
    await app.init();
    server = app.getHttpServer()
  });
  afterAll(async () => {
    app.close()
  });

  it('/ (GET)', () => {
    return request(server)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

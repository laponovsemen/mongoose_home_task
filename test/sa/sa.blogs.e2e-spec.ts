// @ts-ignore
import request from "supertest";
import mongoose from "mongoose";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import process from "process";
import cookieParser from "cookie-parser";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import { useContainer } from "class-validator";


const authE2eSpec = 'Authorization'
const basic = 'Basic YWRtaW46cXdlcnR5'
const mongoURI = process.env.MONGO_URL

describe("TESTING OF CREATING USER AND AUTH", () => {
  let app: INestApplication;
  let server : any
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser())

    app.useGlobalPipes(new ValidationPipe(
        {
          stopAtFirstError: true,
          exceptionFactory: (errors) => {
            const errorsForResponse = []
            console.log(errors , 'ERRORS')

            errors.forEach(e => {
              const constrainedKeys = Object.keys(e.constraints)
              //console.log(constrainedKeys, "constrainedKeys");
              constrainedKeys.forEach((ckey) => {
                errorsForResponse.push({
                  message : e.constraints[ckey],
                  field : e.property
                })
                console.log(errorsForResponse , "errorsForResponse");

              })

            })
            throw new BadRequestException(errorsForResponse);
          }
        }
      )
    )
    app.useGlobalFilters(new HttpExceptionFilter())
    useContainer(app.select(AppModule), {fallbackOnErrors: true})

    await app.init();
    server = app.getHttpServer()
  });
  afterAll(async () => {
    await app.close()
  });
  it("should create user by super admin, login," +
    " create blog and post for this blog ," +
    " ban blog and try to get post of banned blog", async () => {

    await request(server).delete("/testing/all-data")

    const user = await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login",
        password: "password",
        email: "simsbury65@gmail.com"
      })
      .expect(201)

    expect(user.body).toEqual({
      "createdAt": expect.any(String),
      "email": "simsbury65@gmail.com",
      "id": expect.any(String),
      "login": "login",
      "banInfo": {
        "banDate": null,
        "banReason": null,
        "isBanned": false,
      },
    })

    const login = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: "login",
        password: "password",
      })
      .expect(200)
    const accessTokenOfUser = login.body.accessToken


    const createdBlog = await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name : "string",
        description: "stringstring",
        websiteUrl : "simsbury65@gmail.com"
      })
      .expect(201)

    expect(createdBlog.body).toEqual({
        "createdAt": expect.any(String),
         "description": "stringstring",
         "id": expect.any(String),
         "isMembership": false,
         "name": "string",
         "websiteUrl": "simsbury65@gmail.com",
    })

    const createdPostForSpecificBlog = await request(server)
      .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        "title": "string",
        "shortDescription": "stringstring",
        "content": "string"
      })
      .expect(201)
    //extract postId
    const postId = createdPostForSpecificBlog.body.id

    await request(server)
      .get(`/posts/${postId}`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .expect(200)



    const banBlog = await request(server)
      .put(`/sa/blogs/${createdBlog.body.id}/ban`)
      .set("Authorization", basic)
      .send({
        "isBanned": true
      })
      .expect(204)

    await request(server)
      .get(`/posts/${postId}`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .expect(404)

    await request(server)
      .put(`/sa/blogs/${createdBlog.body.id}/ban`)
      .set("Authorization", basic)
      .send({
        "isBanned": false
      })
      .expect(204)

    await request(server)
      .get(`/posts/${postId}`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .expect(200)



  }, 10000)







})
// @ts-ignore
import request from "supertest";
import mongoose from "mongoose";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import process from "process";
import cookieParser from "cookie-parser";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import { ArrayContains, isMongoId, useContainer } from "class-validator";
import {
  BanUserByBloggerDTO,
  BlogDTO,
  CommentForSpecifiedPostDTO,
  PostDTO,
  PostForSpecificBlogDTO,
  UserDTO
} from "../../src/input.classes";


const authE2eSpec = "Authorization";
const basic = "Basic YWRtaW46cXdlcnR5";
const mongoURI = process.env.MONGO_URL;

describe("TESTING OF CREATING USER AND AUTH", () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());

    app.useGlobalPipes(new ValidationPipe(
        {
          stopAtFirstError: true,
          exceptionFactory: (errors) => {
            const errorsForResponse = [];
            console.log(errors, "ERRORS");

            errors.forEach(e => {
              const constrainedKeys = Object.keys(e.constraints);
              //console.log(constrainedKeys, "constrainedKeys");
              constrainedKeys.forEach((ckey) => {
                errorsForResponse.push({
                  message: e.constraints[ckey],
                  field: e.property
                });
                console.log(errorsForResponse, "errorsForResponse");

              });

            });
            throw new BadRequestException(errorsForResponse);
          }
        }
      )
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();
    server = app.getHttpServer();
  });
  afterAll(async () => {
    await app.close();
  });
  it("create user, login, create blog, create another user and ban user2 for blog", async () => {

    await request(server).delete("/testing/all-data");

    const users = [];
    for (let i = 0; i <= 2; i++) {
      const createUserDto: UserDTO = {
        login: `login${i}`,
        password: "password",
        email: `simsbury65${i}@gmail.com`
      };
      const res = await request(server)
        .post("/sa/users")
        .set(authE2eSpec, basic)
        .send(createUserDto);


      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(String),
        login: createUserDto.login,
        "email": createUserDto.email,
        "createdAt": expect.any(String),
        "banInfo": {
          "banDate": null,
          "banReason": null,
          "isBanned": false
        }
      });
      expect(isMongoId(res.body.id)).toBeTruthy();
      users.push({ ...createUserDto, ...res.body });
    }

    const [user0, user1] = users;

    const loginRes = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user0.login,
        password: user0.password
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toEqual({ accessToken: expect.any(String) });
    const { accessToken } = loginRes.body;

    const createBlogDto: BlogDTO = {
      name : "string",
      description: "stringasdstring",
      websiteUrl : "simsbury65@gmail.com"
    }

    const createdBlogRes = await request(server)
      .post(`/blogger/blogs`)
      .auth(accessToken, {type: 'bearer'})
      .send(createBlogDto)



    expect(createdBlogRes.status).toBe(201)
    expect(createdBlogRes.body).toEqual({
        "createdAt": expect.any(String),
         "description": createBlogDto.description,
         "id": expect.any(String),
         "isMembership": false,
         "name": createBlogDto.name,
         "websiteUrl": createBlogDto.websiteUrl,
    })

    const blogId = createdBlogRes.body.id

    const countOfBannedUsersBeforeBanRes = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(accessToken, {type: 'bearer'})
      .expect(200)

    expect(countOfBannedUsersBeforeBanRes.body.items).toHaveLength(0);


    const banUserDto: BanUserByBloggerDTO = {
      "isBanned": true,
      "banReason": "stringstringstringst",
      blogId
    }

    console.log('start ban user for blog');
    await request(server)
      .put(`/blogger/users/${user1.id}/ban`)
      .auth(accessToken, {type: 'bearer'})
      .send(banUserDto)
      .expect(204)

    const countOfBannedUsersAfterBanRes = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(accessToken, {type: 'bearer'})
      .expect(200)

    expect(countOfBannedUsersAfterBanRes.body.items).toHaveLength(1);

    const unbanUserDto: BanUserByBloggerDTO = {
      "isBanned": false,
      "banReason": "stringstringstringst",
      blogId
    }

    await request(server)
      .put(`/blogger/users/${user1.id}/ban`)
      .auth(accessToken, {type: 'bearer'})
      .send(unbanUserDto)
      .expect(204)

    const countOfBannedUsersAfterUnbanRes = await request(server)
      .get(`/blogger/users/blog/${blogId}`)
      .auth(accessToken, {type: 'bearer'})
      .expect(200)

    expect(countOfBannedUsersAfterUnbanRes.body.items).toHaveLength(0);

  }, 10000);
  it("create user, login, create blog, create another user , create posts for specific blog, comment them and get them", async () => {

    await request(server).delete("/testing/all-data");

    const users = [];
    for (let i = 0; i <= 2; i++) {
      const createUserDto: UserDTO = {
        login: `login${i}`,
        password: "password",
        email: `simsbury65${i}@gmail.com`
      };

      const res = await request(server)
        .post("/sa/users")
        .set(authE2eSpec, basic)
        .send(createUserDto);


      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(String),
        login: createUserDto.login,
        "email": createUserDto.email,
        "createdAt": expect.any(String),
        "banInfo": {
          "banDate": null,
          "banReason": null,
          "isBanned": false
        }
      });
      expect(isMongoId(res.body.id)).toBeTruthy();
      users.push({ ...createUserDto, ...res.body });
    }

    const [user0, user1] = users;

    const loginRes1 = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user0.login,
        password: user0.password
      });

    const loginRes2 = await request(server)
      .post("/auth/login")
      .send({
        loginOrEmail: user1.login,
        password: user1.password
      });

    expect(loginRes1.status).toBe(200);
    expect(loginRes1.body).toEqual({ accessToken: expect.any(String)});
    const  accessToken1  = loginRes1.body.accessToken;
    expect(loginRes2.status).toBe(200);
    expect(loginRes2.body).toEqual({ accessToken: expect.any(String)});
    const  accessToken2  = loginRes2.body.accessToken;

    const createBlogDto1: BlogDTO = {
      name : "string",
      description: "stringasdstring",
      websiteUrl : "simsbury65@gmail.com"
    }

    const createCommentDto1: CommentForSpecifiedPostDTO = {
      content : "ldklkdjflnalduhsajklcnzLKkcnx"
    }

    const createBlogDto2: BlogDTO = {
      name : "string",
      description: "stringasdstring",
      websiteUrl : "simsbury65@gmail.com"
    }

    const createdBlogRes1 = await request(server)
      .post(`/blogger/blogs`)
      .auth(loginRes1.body.accessToken, {type: 'bearer'})
      .send(createBlogDto1)

    const createdBlogRes2 = await request(server)
      .post(`/blogger/blogs`)
      .auth(loginRes1.body.accessToken, {type: 'bearer'})
      .send(createBlogDto2)





    expect(createdBlogRes1.status).toBe(201)
    expect(createdBlogRes1.body).toEqual({
        "createdAt": expect.any(String),
         "description": createBlogDto1.description,
         "id": expect.any(String),
         "isMembership": false,
         "name": createBlogDto1.name,
         "websiteUrl": createBlogDto1.websiteUrl,
    })

    const blogId1 = createdBlogRes1.body.id

    expect(createdBlogRes2.status).toBe(201)
    expect(createdBlogRes2.body).toEqual({
      "createdAt": expect.any(String),
      "description": createBlogDto2.description,
      "id": expect.any(String),
      "isMembership": false,
      "name": createBlogDto2.name,
      "websiteUrl": createBlogDto2.websiteUrl,
    })

    const blogId2 = createdBlogRes2.body.id

    const createPostDTO1 : PostForSpecificBlogDTO = {
      title : "title",
      shortDescription : "shortDescription",
      content : "content",
    }

    const createPostDTO2 : PostForSpecificBlogDTO = {
      title : "title",
      shortDescription : "shortDescription",
      content : "content",
    }
    console.log(accessToken2 ," accessToken2");
    for (let i = 0; i < 1; i++) {
      const post = await request(server)
        .post(`/blogger/blogs/${blogId1}/posts`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createPostDTO1)

      expect(post.status).toBe(201)

      const comment = await request(server)
        .post(`/posts/${post.body.id}/comments`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createCommentDto1)

      expect(comment.status).toBe(201)
    }

    for (let i = 0; i < 1; i++) {
      const post = await request(server)
        .post(`/blogger/blogs/${blogId2}/posts`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createPostDTO2)

      expect(post.status).toBe(201)

      const comment = await request(server)
        .post(`/posts/${post.body.id}/comments`)
        .auth(accessToken1, {type: 'bearer'})
        .send(createCommentDto1)

      expect(comment.status).toBe(201)
    }


    console.log("final request");
    const allCommentsForSpecifiedUser = await request(server)
      .get(`/blogger/blogs/comments`)
      .auth(accessToken1, {type: 'bearer'})
    expect(allCommentsForSpecifiedUser.status).toEqual(200)
    expect(allCommentsForSpecifiedUser.body).toEqual({})
  }, 200000);

});
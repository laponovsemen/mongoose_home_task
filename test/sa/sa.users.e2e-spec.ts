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
  it("should create user by super admin", async () => {

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

    for(let i = 0; i < 10 ; i++){
      await request(server)
        .post("/sa/users")
        .set(authE2eSpec, basic)
        .send({
          login: `login${i}`,
          password: `password${i}`,
          email: "simsbury65@gmail.com"
        })
    }

    const allUsers = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)



    expect(allUsers.body).toEqual({
      page : 1,
      pageSize : 10,
      pagesCount : 2,
      totalCount : 11,
      items : [
        { banInfo: {banDate: null, banReason: null, isBanned: false, },
        createdAt: expect.any(String),
        email: "simsbury65@gmail.com",
        id: expect.any(String),
        login: "login9", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login8", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login7", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login6", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login5", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login4", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login3", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login2", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login1", },

        {banInfo: {banDate: null, banReason: null, isBanned: false, },
          createdAt: expect.any(String),
          email: "simsbury65@gmail.com",
          id: expect.any(String),
          login: "login0", },
      ],
      } )

    const idOfUserToBan = allUsers.body.items[0].id

    await request(server)
      .put(`/sa/users/${idOfUserToBan}/ban`)
      .send({
        isBanned: true,
        banReason: "stringstringstringst",
      })
      .expect(401)

    const bannedUser = await request(server)
      .put(`/sa/users/${idOfUserToBan}/ban`)
      .set(authE2eSpec, basic)
      .send({
        isBanned: true,
        banReason: "stringstringstringst",
      })
      .expect(204)

    //delete everything
     await request(server).delete("/testing/all-data")

    //create one user
    await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login",
        password: "password",
        email: "simsbury65@gmail.com"
      })
      .expect(201)



    const result = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)

    const oneUser = result.body.items[0]
    const userId = oneUser.id
    console.log(oneUser , "oneUser");

    const banUser = await request(server)
      .put(`/sa/users/${userId}/ban`)
      .set(authE2eSpec, basic)
      .send({
        isBanned: true,
        banReason: "stringstringstringst",
      })

    const resultAfterBan = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)

    const oneUserAfterBan = resultAfterBan.body.items[0]
    expect(oneUserAfterBan).toEqual({
      id: userId,
      login: 'login',
      email: 'simsbury65@gmail.com',
      createdAt: expect.any(String),
      banInfo: {
        banDate: expect.any(String),
        banReason: 'stringstringstringst',
        isBanned: true
      }
    })
    console.log(oneUserAfterBan, "oneUserAfterBan");

    const unbanUser = await request(server)
      .put(`/sa/users/${userId}/ban`)
      .set(authE2eSpec, basic)
      .send({
        isBanned: false,
        banReason: "stringstringstringst",
      })

    const resultAfterUnban = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)

    const oneUserAfterUnban = resultAfterUnban.body.items[0]
    expect(oneUserAfterUnban).toEqual({
      id: userId,
      login: 'login',
      email: 'simsbury65@gmail.com',
      createdAt: expect.any(String),
      banInfo: {
        banDate: null,
        banReason: null,
        isBanned: false
      }
    })

    }, 10000)
  it("shoud create user , ban it by SA and try to login => result must be 401", async ()=>{
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

    const result = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)

    const oneUser = result.body.items[0]
    const userId = oneUser.id
    console.log(oneUser , "oneUser");

    // login of user
    const loginProcedure = await request(server)
      .post(`/auth/login`)
      .send({
        loginOrEmail: "simsbury65@gmail.com",
        password: "password"
      })
      .expect(200)

    //access token of user
    expect(loginProcedure.body).toEqual({accessToken : expect.any(String)})
    const accessTokenOfUser = loginProcedure.body.accessToken

    // try to create blog by blogger with wrong input data
    await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name : "",
        description: "",
        websiteUrl : ""
      })
      .expect(400)

    // try to create blog by blogger with correct input data
    const createdBlog = await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name : "string",
        description: "stringstring",
        websiteUrl : "simsbury65@gmail.com"
      })
      .expect(201)

    const blogId = createdBlog.body.id
    console.log(blogId, " blogId of created blog");

    //try to create post by blogger with wrong input data
    const createdPost = await request(server)
      .post(`/blogger/blogs/${blogId}/posts`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        title: "title",
        shortDescription: "shortDescription",
        content: "content",
      })
      .expect(201)

    const postId = createdPost.body.id
    console.log(postId, " postId of created blog");
    const createdComment = await request(server)
      .post(`/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        "content": "good comment 1 blablalba"
      })
      .expect(201)

    const commentId = createdComment.body.id
    const foundComment = await request(server)
      .get(`/comments/${commentId}`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .expect(200)

    expect(foundComment.body).toEqual({
      "commentatorInfo": {
        "userId": expect.any(String),
        "userLogin": "login"
      },
      "content": "good comment 1 blablalba",
      "createdAt": expect.any(String),
      "id": expect.any(String),
      "likesInfo": {
        "dislikesCount": 0,
        "likesCount": 0,
        "myStatus": "None"
      }
    });
      // try to ban user

    const banUser = await request(server)
      .put(`/sa/users/${userId}/ban`)
      .set(authE2eSpec, basic)
      .send({
        isBanned: true,
        banReason: "stringstringstringst",
      })

    await request(server)
      .get(`/comments/${commentId}`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .expect(404)

  }, 10000)


  it("shoud create user , create blog and try to delete blog", async ()=> {
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

    const userNumberTwo = await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login2",
        password: "password2",
        email: "simsbury652@gmail.com"
      })
      .expect(201)

    const result = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)

    const oneUser = result.body.items[0]
    const userId = oneUser.id
    console.log(oneUser, "oneUser");

    // login of user
    const loginProcedure = await request(server)
      .post(`/auth/login`)
      .send({
        loginOrEmail: "simsbury65@gmail.com",
        password: "password"
      })
      .expect(200)

    const loginProcedureOfUserTwo = await request(server)
      .post(`/auth/login`)
      .send({
        loginOrEmail: "simsbury652@gmail.com",
        password: "password2"
      })
      .expect(200)


    //access token of user
    expect(loginProcedure.body).toEqual({ accessToken: expect.any(String) })
    const accessTokenOfUser = loginProcedure.body.accessToken
    const accessTokenOfUserNumberTwo = loginProcedureOfUserTwo.body.accessToken

    // try to create blog by blogger with wrong input data
    await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name: "",
        description: "",
        websiteUrl: ""
      })
      .expect(400)

    // try to create blog by blogger with correct input data
    const createdBlog = await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name: "string",
        description: "stringstring",
        websiteUrl: "simsbury65@gmail.com"
      })
      .expect(201)

    const deletedBlogByOtherUser = await request(server)
      .delete(`/blogger/blogs/${createdBlog.body.id}`)
      .set("Authorization", `Bearer ${accessTokenOfUserNumberTwo}`)
      .expect(403)

    await request(server)
      .delete(`/blogger/blogs/63189b06003380064c4193be`)
      .set("Authorization", `Bearer ${accessTokenOfUserNumberTwo}`)
      .expect(404)

    const deletedBlog = await request(server)
      .delete(`/blogger/blogs/${createdBlog.body.id}`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .expect(204)

    await request(server)
      .delete(`/blogger/blogs/${createdBlog.body.id}`)
      .expect(401)
  })
  it("shoud create user , create blog and create post and use new andpoint to delete and update", async ()=> {
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

    const userNumberTwo = await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login2",
        password: "password2",
        email: "simsbury652@gmail.com"
      })
      .expect(201)

    const result = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)

    const oneUser = result.body.items[0]
    const userId = oneUser.id
    console.log(oneUser, "oneUser");

    // login of user
    const loginProcedure = await request(server)
      .post(`/auth/login`)
      .send({
        loginOrEmail: "simsbury65@gmail.com",
        password: "password"
      })
      .expect(200)

    const loginProcedureOfUserTwo = await request(server)
      .post(`/auth/login`)
      .send({
        loginOrEmail: "simsbury652@gmail.com",
        password: "password2"
      })
      .expect(200)


    //access token of user
    expect(loginProcedure.body).toEqual({ accessToken: expect.any(String) })
    const accessTokenOfUser = loginProcedure.body.accessToken
    const accessTokenOfUserNumberTwo = loginProcedureOfUserTwo.body.accessToken


    // try to create blog by blogger with correct input data
    const createdBlog = await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name: "string",
        description: "stringstring",
        websiteUrl: "simsbury65@gmail.com"
      })
      .expect(201)

    const blogId = createdBlog.body.id
    const createdPostForSpecificBlog = await request(server)
      .post(`/blogger/blogs/${createdBlog.body.id}/posts`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        content:"content",
        shortDescription:"shortDescription",
        title:"title",
        blogId:blogId})
      .expect(201)

    const postId = createdPostForSpecificBlog.body.id

    //try to update post
    await request(server)
      .put(`/blogger/blogs/${blogId}/posts/${postId}`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        content:"content new post",
        shortDescription:"shortDescription after update",
        title:"title after update",
        blogId:createdBlog.body.id})
      .expect(204)
  })
  it("shoud create user , create blog and ban blog", async ()=> {
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

    const userNumberTwo = await request(server)
      .post("/sa/users")
      .set(authE2eSpec, basic)
      .send({
        login: "login2",
        password: "password2",
        email: "simsbury652@gmail.com"
      })
      .expect(201)

    const result = await request(server)
      .get("/sa/users")
      .set(authE2eSpec, basic)

    const oneUser = result.body.items[0]
    const userId = oneUser.id
    console.log(oneUser, "oneUser");

    // login of user
    const loginProcedure = await request(server)
      .post(`/auth/login`)
      .send({
        loginOrEmail: "simsbury65@gmail.com",
        password: "password"
      })
      .expect(200)

    const loginProcedureOfUserTwo = await request(server)
      .post(`/auth/login`)
      .send({
        loginOrEmail: "simsbury652@gmail.com",
        password: "password2"
      })
      .expect(200)


    //access token of user
    expect(loginProcedure.body).toEqual({ accessToken: expect.any(String) })
    const accessTokenOfUser = loginProcedure.body.accessToken
    const accessTokenOfUserNumberTwo = loginProcedureOfUserTwo.body.accessToken


    // try to create blog by blogger with correct input data
    const createdBlog = await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name: "string",
        description: "stringstring",
        websiteUrl: "simsbury65@gmail.com"
      })
      .expect(201)

    await request(server)
      .post(`/blogger/blogs`)
      .set("Authorization", `Bearer ${accessTokenOfUser}`)
      .send({
        name: "string2",
        description: "stringstring2",
        websiteUrl: "simsbury65@gmail.com"
      })
      .expect(201)

    const allBlogsBeforeBan = await request(server)
      .get(`/blogs`)
      .expect(200)

    expect(allBlogsBeforeBan.body.items.length).toEqual(2)
    const blogId = createdBlog.body.id

    await request(server)
      .put(`/sa/blogs/${blogId}/ban`)
      .set("Authorization", basic)
      .send({
        name: "string",
        description: "stringstring",
        websiteUrl: "simsbury65@gmail.com"
      })
      .expect(400)


    const bannedBlog = await request(server)
        .put(`/sa/blogs/${blogId}/ban`)
        .set("Authorization", basic)
        .send({"isBanned":true})
        .expect(204)


    const allBlogsAfterBan = await request(server)
      .get(`/blogs`)
      .expect(200)

    expect(allBlogsAfterBan.body.items.length).toEqual(1)

    const BlogAfterBan = await request(server)
      .get(`/blogs/${blogId}`)
      .expect(404)
  },10000)






})
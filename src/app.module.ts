import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { BlogsService } from "./blogs/blogs.service";
import { BlogsRepository } from "./blogs/blogs.repository";
import * as process from "process";
import {
  APIComment, APILike,
  APIPost, APISession,
  Blog, BloggerBansForSpecificBlog, BloggerBansForSpecificBlogSchema,
  BlogsSchema,
  CommentsSchema, LikesSchema,
  PostsSchema, SessionSchema,
  User,
  UsersSchema
} from "./mongo/mongooseSchemas";
import { Common } from "./common";
import { BloggerBlogsController } from "./blogs/blogger.blogs.controller";
import { TestingController } from "./testing/testing.controller";
import { TestingService } from "./testing/testing.service";
import { PostsRepository } from "./posts/posts.repository";
import { UsersRepository } from "./users/users.reposiroty";
import { CommentsRepository } from "./comments/comments.repository";
import { PostsController } from "./posts/posts.controller";
import { PostsService } from "./posts/posts.service";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";
import { AuthModule } from "./auth/auth.module";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { EmailAdapter } from "./auth/email.adapter";
import { LikeService } from "./likes/likes.service";
import { LikeRepository } from "./likes/likes.repository";
import { CommentsController } from "./comments/comments.controller";
import { CommentsService } from "./comments/comments.service";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { BlogIdExistsRule } from "./auth/custom.validators/blogIdExists.validator";
import { SecurityDevicesRepository } from "./security.devices/security.devices.repository";
import { SecurityDevicesService } from "./security.devices/security.devices.service";
import { SecurityDevicesController } from "./security.devices/security.devices.controller";
import { BlogsController } from "./blogs/blogs.controller";
import { SABlogsController } from "./blogs/sa.blogs.controller";
import { SAUsersController } from "./users/sa.users.controller";
import { BanProcedureCommand, BanProcedureUseCase } from "./users/use-cases/banProcedure-use-case";
import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import {
  GettingAllUsersForSuperAdminCommand,
  GettingAllUsersForSuperAdminUseCase
} from "./users/use-cases/getting-all-users-for-super-admin";
import {
  GettingAllBlogsForSpecifiedBloggerCommand,
  GettingAllBlogsForSpecifiedBloggerUseCase
} from "./blogs/use-cases/getting-all-blogs-for-specified-blogger";
import { BanBlogCommand, BanBlogUseCase } from "./blogs/use-cases/ban-blog-use-case";
import { BlogsQueryRepository } from "./blogs/blogs.query.repository";
import { BanUserByBloggerCommand, BanUserByBloggerUseCase } from "./blogs/use-cases/ban-user-by-blogger-use-case";
import {
  GetBannedUsersForSpecificBlogCommand,
  GetBannedUsersForSpecificBlogUseCase
} from "./blogs/use-cases/get-banned-users-for-specific-blog-use-case";
import { BansRepository } from "./blogs/bans.repository";
import { BloggerUsersController } from "./blogs/blogger.users.controller";
import {
  BanVerificationOfUserCommand,
  BanVerificationOfUserUseCase
} from "./posts/use-cases/ban-verification-of-user-use-case";
import { GetAllCommentForUserCommand, GetAllCommentForUserUseCase } from "./blogs/use-cases/get-all-comments-for-user";
import { PostsQueryRepository } from "./posts/posts.query.repository";
import { CommentsQueryRepository } from "./comments/comments.query.repository";
const modules = [AuthModule]
import { TypeOrmModule } from '@nestjs/typeorm';

const services = [AppService,BlogsService, PostsService, TestingService, UsersService, AuthService,
  LikeService, CommentsService, JwtService, SecurityDevicesService]

const repositories = [BlogsRepository, PostsRepository, UsersRepository,CommentsRepository, LikeRepository,CommentsQueryRepository,
  BlogsQueryRepository, SecurityDevicesRepository,BansRepository, PostsQueryRepository]

const useCases = [BanProcedureUseCase, GettingAllUsersForSuperAdminUseCase,BanVerificationOfUserUseCase,GetAllCommentForUserUseCase,
  GettingAllBlogsForSpecifiedBloggerUseCase, BanBlogUseCase,BanUserByBloggerUseCase , GetBannedUsersForSpecificBlogUseCase]

const commands = [BanProcedureCommand, GettingAllUsersForSuperAdminCommand,BanVerificationOfUserCommand,GetAllCommentForUserCommand,
  GettingAllBlogsForSpecifiedBloggerCommand, BanBlogCommand,BanUserByBloggerCommand, GetBannedUsersForSpecificBlogCommand]

const adapters = [EmailAdapter, Common, BlogIdExistsRule]

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      autoLoadEntities: false,
      synchronize: false,
    }),
    CqrsModule,
    JwtModule.register({secret: "123"}),
    ThrottlerModule.forRoot({
    ttl: 10,
    limit: 500,
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([{
      name: Blog.name,
      schema: BlogsSchema
    }, {
      name: APIPost.name,
      schema: PostsSchema
    }, {
      name: APIComment.name,
      schema: CommentsSchema
    }, {
      name: User.name,
      schema: UsersSchema
    }, {
      name: APILike.name,
      schema: LikesSchema
    }, {
      name: APISession.name,
      schema: SessionSchema
    }, {
      name: BloggerBansForSpecificBlog.name,
      schema: BloggerBansForSpecificBlogSchema
    }])],

  controllers: [AppController, BloggerBlogsController, TestingController,BlogsController,SABlogsController,SAUsersController,
    PostsController, UsersController, AuthController, CommentsController, SecurityDevicesController, BloggerUsersController],

  providers: [...modules,
    ...services,
    ...repositories,
    ...useCases,
    ...commands,
    ...adapters,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }]
})
export class AppModule {
}


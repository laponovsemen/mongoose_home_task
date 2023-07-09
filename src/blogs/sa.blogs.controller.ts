import {
  Body,
  Controller,
  Delete,
  Get, HttpCode, HttpStatus, NotFoundException,
  Param,
  Post,
  Put,
  Query, Req, Res, UseGuards
} from "@nestjs/common";
import {
  APIPost,
  APIPostDTO,
  Blog,
  WithPagination,
} from '../mongo/mongooseSchemas';
import { Common } from '../common';
import {
  BlogsPaginationCriteriaType,
  paginationCriteriaType,
  PaginatorViewModelType,
  PostsPaginationCriteriaType,
} from '../appTypes';
import express, {Request, Response} from 'express';
import { BlogsService } from './blogs.service';
import { isNotEmpty, IsNotEmpty, IsString, IsUrl, Length } from "class-validator";
import { AllPostsForSpecificBlogGuard, AuthGuard, BasicAuthGuard } from "../auth/auth.guard";
import { BanBlogDTO, BlogDTO, PostForSpecificBlogDTO } from "../input.classes";
import { CommandBus } from "@nestjs/cqrs";
import { BanBlogCommand } from "./use-cases/ban-blog-use-case";
import { BlogsQueryRepository } from "./blogs.query.repository";





@Controller('sa/blogs')
export class SABlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly common: Common,
    private readonly commandBus: CommandBus,
  ) {}



  @Get()
  @HttpCode(200)
  async getAllBlogs(@Query() QueryParams,): Promise<PaginatorViewModelType<any>> {
    const paginationCriteria: paginationCriteriaType =
      this.common.getPaginationCriteria(QueryParams);
    return this.blogsQueryRepository.getAllBlogs(paginationCriteria);
  }
  @UseGuards(BasicAuthGuard)
  @Put("/:blogId/ban")
  @HttpCode(204)
  async banBlog(@Body() DTO : BanBlogDTO,
                @Param("blogId") blogId
                ) {


    await this.commandBus.execute(new BanBlogCommand(DTO, blogId))
    return
  }


}

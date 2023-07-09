import {
  Body,
  Controller,
  Delete, ForbiddenException,
  Get,
  HttpCode, HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query, Req,
  Res, UseGuards
} from "@nestjs/common";
import { BlogsService } from "../blogs/blogs.service";
import { Common } from "../common";
import { paginationCriteriaType, PaginatorViewModelType } from "../appTypes";
import { Blog } from "../mongo/mongooseSchemas";
import { PostsService } from "./posts.service";
import { IsNotEmpty, Length, Matches } from "class-validator";
import { CommentForSpecifiedPostDTO, LikeStatusDTO, PostDTO } from "../input.classes";
import { LikeRepository } from "../likes/likes.repository";
import { LikeService } from "../likes/likes.service";
import { AuthGuard, BasicAuthGuard } from "../auth/auth.guard";
import { Request, Response } from "express";
import { User } from "../auth/decorators/public.decorator";
import { CommandBus } from "@nestjs/cqrs";
import { BanVerificationOfUserCommand } from "./use-cases/ban-verification-of-user-use-case";




@Controller('/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly common: Common,
    private readonly commandBus: CommandBus,
    private readonly likeService : LikeService
  ) {
  }
  @UseGuards(AuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePost( @Req() req : Request,
                  @Res({passthrough : true}) res : Response,
                  @Param('id') postId,
                  @Body() DTO : LikeStatusDTO) {
    const token = req.headers.authorization.split(" ")[1]
    console.log(req.headers, "request.headers");
    const result = await this.likeService.likePost(DTO, token, postId);
    if(!result){
      throw new NotFoundException()
    }
    return true
  }

  @Get(':id/comments')
  async getAllCommentsForSpecificPost(@Req() req : Request,
                                      @Res({passthrough : true}) res : Response,
                                      @Query() QueryParams,
                                      @Param('id') id) {
    const token = req.headers.authorization
    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(QueryParams);
    const result =await  this.postsService.getAllCommentsForSpecificPosts(paginationCriteria, id, token);
    if(!result){
      throw new NotFoundException()
    }
    return result
  }
  @UseGuards(AuthGuard)
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createCommentForSpecificPost(@Req() req : Request,
                                     @Res({passthrough : true}) res : Response,
                                     @Param('id') postId,
                                     @User() user,
                                     @Body() DTO : CommentForSpecifiedPostDTO) {
    const token = req.headers.authorization
    const commentatorId = user.userId
    const postForComment = await this.postsService.getPostById(postId, token)
    if(!postForComment){
      throw new NotFoundException()
    }
    const banVerification = await this.commandBus.execute(new BanVerificationOfUserCommand(commentatorId, postId))
    if(!banVerification){
      throw new ForbiddenException()
    }
    const result = await this.postsService.createCommentForSpecificPost(DTO, postId, token);
    if(!result){
      throw new NotFoundException()
    }
    return result
  }
  @Get()
  async getAllPosts(@Req() req : Request,
                    @Res({passthrough : true}) res : Response,
                    @Query() QueryParams){
    const token = req.headers.authorization
    console.log(token, "accessTtoken")
    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(QueryParams);
    const result = this.postsService.getAllPosts(paginationCriteria, token);
    if(!result){
      throw new NotFoundException("Blog not found")
    }
    return result
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async createNewPost(@Res({passthrough : true}) res : Response,
                      @Body() DTO : PostDTO){

    const result = await this.postsService.createNewPost(DTO);
    if(!result){
      throw new NotFoundException()
    }
    return result
  }
  @UseGuards()
  @Get(':id')
  async getPostById(@Req() req : Request,
                    @Res({passthrough : true}) res : Response,
                    @Param('id') id){
    const token = req.headers.authorization
    //console.log(token, "accessTtoken")
    const result = await this.postsService.getPostById(id, token);
    if(!result){
      throw new NotFoundException("Blog not found")
    }
    return result
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePostById(@Res({passthrough : true}) res : Response,
                       @Param('id') id,
                       @Body() DTO : PostDTO){
    if(!id){
      throw new NotFoundException("id param is undefined or not found")
    }
    const result = await this.postsService.updatePostById(DTO , id);
    if(!result){
      throw new NotFoundException("post not found")
    }
    return
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePostById(@Res({passthrough : true}) res : Response ,
                       @Param('id') id) {
    const result =  await this.postsService.deletePostById(id);
    if(!result){
      throw new NotFoundException("post not found")
    }
    return
  }
}
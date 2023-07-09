import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get, HttpCode, HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import { Request, Response } from "express";
import { CommentForSpecifiedPostDTO, LikeStatusDTO } from "../input.classes";
import { AuthGuard } from "../auth/auth.guard";
import { CommentsService } from "./comments.service";
import { AuthService } from "../auth/auth.service";
import { LikeService } from "../likes/likes.service";

@Controller('comments')
export class CommentsController {
  constructor(protected readonly commentsService : CommentsService,
              protected readonly authService : AuthService,
              protected readonly likeService : LikeService,
              ) {
  }
  @UseGuards(AuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likeComment(@Req() req : Request,
                    @Res({passthrough : true}) res : Response,
                    @Param('commentId') commentId,
                    @Body() DTO : LikeStatusDTO){
    const token = req.headers.authorization.split(" ")[1]
    console.log(req.headers, "request.headers");
    const result = await this.likeService.likeComment(DTO, token, commentId);
    if(!result){
      throw new NotFoundException()
    }
    return true
  }


  @UseGuards(AuthGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(@Req() req : Request,
                      @Res({passthrough : true}) res : Response,
                      @Param('commentId') commentId,
                      @Body() DTO : CommentForSpecifiedPostDTO){
    const token = req.headers.authorization
    const userFromToken = await this.authService.getUserByToken(token)
    const commentToUpdate = await this.commentsService.getCommentById(commentId, token)
    if(!commentToUpdate){
      throw new NotFoundException()
    }
    const userIdFromDB = commentToUpdate.commentatorInfo.userId
    if(userFromToken._id.toString() !== userIdFromDB.toString()){
      throw new ForbiddenException()
    }


    const result = await this.commentsService.updateCommentById(commentId, DTO)
    if(!result){
      throw new NotFoundException()
    }
    return true
  }
  @UseGuards(AuthGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Req() req : Request,
                      @Res({passthrough : true}) res : Response,
                      @Param('commentId') commentId){
    const token = req.headers.authorization
    const userFromToken = await this.authService.getUserByToken(token)
    const commentToDelete = await this.commentsService.getCommentById(commentId, token)
    if(!commentToDelete){
      throw new NotFoundException()
    }
    const userIdFromDB = commentToDelete.commentatorInfo.userId
    if(userFromToken._id.toString() !== userIdFromDB.toString() ){
      throw new ForbiddenException()
    }

    const result = await this.commentsService.deleteCommentById(commentId)
    if(!result){
      throw new NotFoundException()
    }
    return true
  }
  @Get(':commentId')
  @HttpCode(HttpStatus.OK)
  async getCommentById(@Req() req : Request,
                       @Res({passthrough : true}) res : Response,
                       @Param('commentId') commentId){
    const token = req.headers.authorization
    const result =  await this.commentsService.getCommentById(commentId, token)
    console.log(result, "result 228")
    if(!result){
      throw new NotFoundException("post not found")
    }
    return result
  }

}

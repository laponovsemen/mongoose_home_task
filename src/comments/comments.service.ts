import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { CommentForSpecifiedPostDTO } from "../input.classes";
import { AuthService } from "../auth/auth.service";


@Injectable()
export class CommentsService{
  constructor(protected readonly commentsRepository : CommentsRepository,
              protected readonly authService : AuthService) {
  }


  async getCommentById(commentId : string , token : string) {
    let userId = null
    const userFromDb  = await this.authService.getUserByToken(token);
    console.log(userFromDb, "userFromDb");
    console.log(token, "token");
    if(userFromDb){
      userId = userFromDb._id
    }
    console.log(userId, "userId");
    return await this.commentsRepository.getCommentById(commentId, userId);
  }

  async deleteCommentById( commentId : string) {
    return this.commentsRepository.deleteCommentById(commentId);
  }

  async updateCommentById(commentId: string, DTO: CommentForSpecifiedPostDTO) {
    return await this.commentsRepository.updateCommentById(commentId, DTO)
  }
}

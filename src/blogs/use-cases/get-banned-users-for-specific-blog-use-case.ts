import { BanBlogDTO, BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";
import { BlogsRepository } from "../blogs.repository";
import { PostsRepository } from "../../posts/posts.repository";
import { BansRepository } from "../bans.repository";

export class GetBannedUsersForSpecificBlogCommand{
  constructor(public queryParams : any,
              public blogOwnerFromToken : string,
              public blogId : string
  ) {
  }
}
@CommandHandler(GetBannedUsersForSpecificBlogCommand)
export class GetBannedUsersForSpecificBlogUseCase implements ICommandHandler<GetBannedUsersForSpecificBlogCommand>{
  constructor(
    protected common: Common,
    public bansRepository : BansRepository
  ) {

  }
  async execute(command : GetBannedUsersForSpecificBlogCommand) {
    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(command.queryParams);
    return this.bansRepository.getAllBannedUsersForSpecificBlog(paginationCriteria, command.blogOwnerFromToken, command.blogId)
  }
}
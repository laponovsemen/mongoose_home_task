import { BanBlogDTO, BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";
import { PostsRepository } from "../posts.repository";
import { BansRepository } from "../../blogs/bans.repository";

export class BanVerificationOfUserCommand{
  constructor(public commentatorId : string,
              public postId : string,
  ) {
  }
}
@CommandHandler(BanVerificationOfUserCommand)
export class BanVerificationOfUserUseCase implements ICommandHandler<BanVerificationOfUserCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected bansRepository: BansRepository,
    protected common: Common,
  ) {

  }

  async execute(command: BanVerificationOfUserCommand) {
    const post = await this.postsRepository.getPostByIdWithOutLikes(command.postId)
    const blogId = post.blogId
    return !await this.bansRepository.findBanStatusForSpecificUser(blogId.toString(), command.commentatorId)
  }
}
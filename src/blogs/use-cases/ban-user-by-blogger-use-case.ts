import { BanBlogDTO, BanUserByBloggerDTO, BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";
import { BlogsRepository } from "../blogs.repository";
import { PostsRepository } from "../../posts/posts.repository";
import { BansRepository } from "../bans.repository";

export class BanUserByBloggerCommand{
  constructor(public DTO : BanUserByBloggerDTO,
              public userIdToBan : string,
              public ownerId : string
  ) {
  }
}
@CommandHandler(BanUserByBloggerCommand)
export class BanUserByBloggerUseCase implements ICommandHandler<BanUserByBloggerCommand>{
  constructor( public bansRepository : BansRepository ) {

  }
  async execute(command : BanUserByBloggerCommand) {
    console.log("start execution of BanUserByBloggerCommand");

    return await this.bansRepository.banUserForSpecificBlog(command.ownerId, command.userIdToBan, command.DTO )

    //return this.blogsRepository.changeBanStatusOfBlog(command.DTO, command.blogId);
  }
}
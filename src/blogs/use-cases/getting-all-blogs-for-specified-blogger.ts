import { BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";
import { BlogsRepository } from "../blogs.repository";

export class GettingAllBlogsForSpecifiedBloggerCommand{
  constructor(public queryParams : any,
              public userId : string) {
  }
}
@CommandHandler(GettingAllBlogsForSpecifiedBloggerCommand)
export class GettingAllBlogsForSpecifiedBloggerUseCase implements ICommandHandler<GettingAllBlogsForSpecifiedBloggerCommand>{
  constructor(
              protected securityDevicesRepository: SecurityDevicesRepository,
              protected likeRepository: LikeRepository,
              protected blogsRepository: BlogsRepository,
              protected common: Common,
  ) {

  }
  async execute(command : GettingAllBlogsForSpecifiedBloggerCommand) {

    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(command.queryParams);

    return this.blogsRepository.getAllBlogsForSpecifiedBlogger(paginationCriteria, command.userId);



  }
}
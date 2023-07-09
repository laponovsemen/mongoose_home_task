import { BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../users.reposiroty";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";

export class GettingAllUsersForSuperAdminCommand{
  constructor(public queryParams : any,) {
  }
}
@CommandHandler(GettingAllUsersForSuperAdminCommand)
export class GettingAllUsersForSuperAdminUseCase implements ICommandHandler<GettingAllUsersForSuperAdminCommand>{
  constructor(protected usersRepository : UsersRepository,
              protected securityDevicesRepository: SecurityDevicesRepository,
              protected likeRepository: LikeRepository,
              protected commentsRepository: CommentsRepository,
              protected common: Common,
  ) {

  }
  async execute(command : GettingAllUsersForSuperAdminCommand) {

    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(command.queryParams);
    return this.usersRepository.getAllUsersSA(paginationCriteria)
  }
}
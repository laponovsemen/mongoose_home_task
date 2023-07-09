import { BanUserDTO } from "../../input.classes";
import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../users.reposiroty";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";

export class BanProcedureCommand{
  constructor(public userId: string,
              public DTO: BanUserDTO,
              ) {
  }
}
@CommandHandler(BanProcedureCommand)
export class BanProcedureUseCase implements ICommandHandler<BanProcedureCommand>{
  constructor(protected usersRepository : UsersRepository,
              protected securityDevicesRepository: SecurityDevicesRepository,
              protected likeRepository: LikeRepository,
              protected commentsRepository: CommentsRepository,
  ) {

  }
  async execute(command : BanProcedureCommand) {
    const newBanStatusOfUser = command.DTO.isBanned

    if(!newBanStatusOfUser){
      await this.likeRepository.makeLikesVisible(command.userId)
      await this.commentsRepository.makeCommentsVisible(command.userId)
      return await this.usersRepository.unbanUserDB(command.userId, command.DTO)

    } else {
      await this.securityDevicesRepository.deleteAllSessionsForSpecifiedUser(command.userId)
      await this.likeRepository.makeLikesHiden(command.userId)
      await this.commentsRepository.makeCommentsHiden(command.userId)
      return await this.usersRepository.banUserDB(command.userId, command.DTO)
    }
  }
}
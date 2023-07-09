import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.reposiroty";
import { paginationCriteriaType } from "../appTypes";
import { BanUserDTO } from "../input.classes";


@Injectable()
export class UsersService{
  constructor(protected readonly usersRepository : UsersRepository) {
  }
  getAllUsers(paginationCriteria : paginationCriteriaType){
    return this.usersRepository.getAllUsers(paginationCriteria)
  }

  createUser(DTO : any){
    return this.usersRepository.createUser(DTO)
  }

  deleteUserById(id : string){
    return this.usersRepository.deleteUserById(id)
  }

  async findUserByLoginOrEmail(loginOrEmail : string, pass : string) {
    return this.usersRepository.findUserByLoginOrEmail(loginOrEmail, pass)
  }
}


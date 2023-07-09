import { Injectable } from "@nestjs/common";
import { InjectModel, Prop } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentsDocument, User, UsersDocument } from "../mongo/mongooseSchemas";
import { Common } from "../common";
import { paginationCriteriaType } from "../appTypes";
import add from 'date-fns/add'
import { ObjectId } from "mongodb";
import { addMinutes } from "date-fns";
import { SkipThrottle } from "@nestjs/throttler";
import { BanUserDTO } from "../input.classes";

@SkipThrottle()
@Injectable()
export class UsersRepository{
  constructor(@InjectModel(User.name) private  usersModel : Model<UsersDocument>,
              protected readonly common : Common){

  };
  async deleteAllData(){
    await this.usersModel.deleteMany({})
  }
  async getAllUsers(paginationCriteria: paginationCriteriaType) {

    const searchLoginTerm = paginationCriteria.searchLoginTerm
    const searchEmailTerm = paginationCriteria.searchEmailTerm
    let searchParams : any[] = []
    if (searchEmailTerm) searchParams.push({ email: { $regex: searchEmailTerm, $options: "i" } })
    if (searchLoginTerm) searchParams.push({ login: { $regex: searchLoginTerm, $options: "i" } })

    let filter: { $or?: any[] } = { $or: searchParams }
    if (searchParams.length === 0) filter = {}


    const pageSize = paginationCriteria.pageSize;
    const totalCount = await this.usersModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);


    const result = await this.usersModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(ToSkip)
      .limit(pageSize)
      .lean() //.exec()
    const items = result.map((item) => {
      return this.common.mongoUserSlicing(item)
    })


    console.log(
      {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: items,
      },
      'its fucking result',
    );
    return {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: items,
    };
  }

  async createUser(DTO: any) {
    const dateOfCreation = new Date()
    const login = DTO.login
    const password = DTO.password
    const email = DTO.email
    const createdAt = dateOfCreation
    const newlyCreatedUser : User = await this.usersModel.create({
      login,
      password,
      email,
      createdAt,
      banInfo: {
        banDate: null,
        banReason: null,
        isBanned: false,
      }
    })

    return {
      id: newlyCreatedUser._id,
      login,
      email,
      createdAt,
      banInfo: {
        banDate: null,
        banReason: null,
        isBanned: false,
      }
    }
  }

  async deleteUserById(id: string) {
    const userId = this.common.tryConvertToObjectId(id)
    if (!userId) {
      return null
    }
    const deletedUser = await this.usersModel.deleteOne({ _id: userId })
    return deletedUser.deletedCount === 1
  }

  findUserByLoginOrEmail(loginOrEmail: string, pass : string) {
    const filter = {$or :[{login : loginOrEmail}, {email : loginOrEmail}]}
    return this.usersModel.findOne(filter)
  }
  async createUnconfirmedUser(login: string, password: string, email: string) {
    const dateOfCreation = new Date()
    const codeDateOfExpiary = add(dateOfCreation, {minutes: 10})
    const codeToSend = this.common.createEmailSendCode()
    const newUnconfirmedUser: User = {
      createdAt: dateOfCreation,
      email: email,
      login: login,
      password: password,
      isConfirmed: false,
      code: codeToSend,
      codeDateOfExpiary: codeDateOfExpiary,
      banInfo : {
        banDate : null,
        banReason : null,
        isBanned : false
      }
    }
    const newlyCreatedUser = await this.usersModel.create(newUnconfirmedUser)
    return {
      id : newlyCreatedUser._id,
      createdAt: dateOfCreation,
      email: email,
      login: login,
      code: codeToSend,

    }

  }

  async findUserByEmail(email: string) {
    const filter = { email: email }
    return this.usersModel.findOne(filter);
  }

  async changeUsersConfirmationCode(_id: ObjectId, confirmationCode: string) {
    const newCodeDateOfExpiary = addMinutes(new Date(), 30)
    await this.usersModel.updateOne({_id}, {$set : {code : confirmationCode, codeDateOfExpiary : newCodeDateOfExpiary}})
  }

  async findUserByRegistrationCode(code: string) {
    const foundUser = await this.usersModel.findOne({code : code})
    return foundUser
  }

  async findUserCodeFreshness(foundUser: User) {
    return new Date() < foundUser.codeDateOfExpiary!
  }

  async makeUserConfirmed(foundUser: User) {
    await this.usersModel.updateOne({_id : foundUser._id},
      {$set: {
          isConfirmed: true,
          code: null,
          codeDateOfExpiary: null,
      }})
  }

  async findUserByLogin(login: string) {
    return this.usersModel.findOne({ login: login });
  }

  async findUserById(userId: string) {
    console.log(userId, "userId in findUserById");
    const result = await this.usersModel.findOne({_id : userId});
    console.log(result, "result findUserById findUserById");
    return result
  }

  async banUnbanUserDB(userId: string, DTO: BanUserDTO) {
    const isBanned = DTO.isBanned

      const banDate = new Date()
      const banReason = DTO.banReason




  }

  async banUserDB(userId: string, DTO: BanUserDTO) {
    const isBanned = DTO.isBanned
    const banDate = new Date()
    const banReason = DTO.banReason
    return this.usersModel.updateOne({ _id: userId },
      {
        $set: {
          "banInfo.banDate": banDate,
          "banInfo.banReason": banReason,
          "banInfo.isBanned": isBanned,
        }
      });
  }

  async unbanUserDB(userId: string, DTO: BanUserDTO) {
  const isBanned = DTO.isBanned
  const banDate = new Date()
  const banReason = DTO.banReason
    return this.usersModel.updateOne({ _id: userId },
      {
        $set: {
          "banInfo.banDate": null,
          "banInfo.banReason": null,
          "banInfo.isBanned": isBanned,
        }
      });
  }


  async getAllUsersSA(paginationCriteria: paginationCriteriaType) {
    const banStatus = paginationCriteria.banStatus
    const searchLoginTerm = paginationCriteria.searchLoginTerm
    const searchEmailTerm = paginationCriteria.searchEmailTerm
    let searchParams: any[] = []
    if (searchEmailTerm) searchParams.push({ email: { $regex: searchEmailTerm, $options: "i" } })
    if (searchLoginTerm) searchParams.push({ login: { $regex: searchLoginTerm, $options: "i" } })
    if (banStatus === "banned") {
      searchParams.push({"banInfo.isBanned" : true})
    } else if (banStatus === "notBanned"){
      searchParams.push({"banInfo.isBanned" : false})
    }

    let filter: { $or?: any[] } = { $or: searchParams }
    if (searchParams.length === 0) filter = {}


    const pageSize = paginationCriteria.pageSize;
    const totalCount = await this.usersModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip = paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);


    const result = await this.usersModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(ToSkip)
      .limit(pageSize)
      .lean() //.exec()
    const items = result.map((item) => {
      return this.common.mongoUserSlicing(item)
    })


    console.log(
      {
        pageSize: pageSize,
        totalCount: totalCount,
        pagesCount: pagesCount,
        page: page,
        items: items,
      },
      'its fucking result',
    );
    return {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: items,
    };

  }
}
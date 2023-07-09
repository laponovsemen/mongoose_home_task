import { LikeStatusDTO } from "../input.classes";
import { ObjectId } from "mongodb";
import { InjectModel } from "@nestjs/mongoose";
import { APILike, LikesDocument, parentTypeEnum, StatusTypeEnum } from "../mongo/mongooseSchemas";
import { Model, Types } from "mongoose";
import { Injectable } from "@nestjs/common";
import { Common } from "../common";


@Injectable()
export class LikeRepository{
  constructor(@InjectModel(APILike.name) private  likesModel : Model<LikesDocument>,
              protected readonly common : Common) {
  }
  async createNewLike(Like : APILike){

  }

  async likePost(DTO: LikeStatusDTO, Id: string, login : string, postId: string) {
    const myLike = await this.findMyStatusForSpecificPost(new ObjectId(postId), Id)
    const status = DTO.likeStatus
    if (!myLike) {
      const dateOfCreation = new Date()
      const parentId = new ObjectId(postId)
      const parentType = parentTypeEnum.post
      const addedAt = dateOfCreation
      const userId = new ObjectId(Id)


      const newLikeToCreate: APILike = {
        parentId: parentId,
        parentType: parentType,
        addedAt: addedAt,
        userId: userId,
        login: login,
        status: status,
        isHiden : false
      }
      await this.likesModel.create({
        parentId: parentId,
        parentType: parentType,
        addedAt: addedAt,
        userId: userId,
        login: login,
        status: status,
        isHiden : false
      })
      return true
    } else {

      await this.changeMyLikeStatus(status, Id,  postId, parentTypeEnum.post)

      return true
    }
  }

  async changeMyLikeStatus(status : StatusTypeEnum, userId : string, parentId: string, parentType: parentTypeEnum){
    await this.likesModel.updateOne({$and:
        [
          {parentId : new ObjectId(parentId)},
          {parentType : parentType},
          {userId : new ObjectId(userId)}
        ]
    }, {
      $set: {
        status : status
      }
    })

  }

  async findLikesCountForSpecificPost(postId: ObjectId) {
    const likes = await this.likesModel.find({ $and: [
        { parentId: postId},
        {  parentType: parentTypeEnum.post},
        { status: StatusTypeEnum.Like },
        {isHiden: false}
      ]})
      .lean().exec();
    return likes.length
  }

  async findDisikesCountForSpecificPost(postId: ObjectId) {
    const dislikes = await this.likesModel.find({ $and: [
        {parentId: postId},
        {parentType: parentTypeEnum.post},
        {status: StatusTypeEnum.Dislike},
        {isHiden: false}
      ]
    })
    return dislikes.length

  }

  async findNewestLikesForSpecificPost(postId:ObjectId) {
    const likesFilter = { $and: [
        { parentId: postId },
        { parentType: parentTypeEnum.post },
        { status: StatusTypeEnum.Like },
        { isHiden : false}
      ] }
    const newestLikesToUpdate = await this.likesModel
      .find(likesFilter, { _id: 0, status: 0, parentId: 0, parentType:0 })
      .sort({ addedAt: "desc" })
      .limit(3)

    //console.log(newestLikesToUpdate, " newestLikesToUpdate")
    return newestLikesToUpdate
  }

  async findMyStatusForSpecificPost(postId: ObjectId, userIdAsString: string) {
    console.log(userIdAsString, "userIdAsString")
    const userId = this.common.tryConvertToObjectId(userIdAsString)
    console.log(userId, "after user id");
    if(!userId){
      console.log(userId, "нету юзер ай ди");
      return null

    }
    console.log("before filter");
    console.log({
      parentId: postId,
      parentType: parentTypeEnum.post,
      userId: userId
    }, "filter");
    const filter = {
      parentId: postId,
      parentType: parentTypeEnum.post,
      userId: userId
    }

    const result = await this.likesModel.findOne(filter);
    console.log(result, "result");
    return result
  }
  async findMyStatusForComment(commentId: ObjectId, userIdAsString: string) {
    const userId = this.common.tryConvertToObjectId(userIdAsString)
    if(!userId){
      return null
    }
    const filter = {
      $and:
        [
          { parentId: commentId },
          { parentType: parentTypeEnum.comment },
          { userId: new ObjectId(userId) }
        ]
    }
    const result = await this.likesModel.findOne(filter);
    console.log(result);
    return result
  }

  async deleteAllData(){
    await this.likesModel.deleteMany({})
  }

  async likeComment(DTO: LikeStatusDTO, userIdFromToken: string, login: string, commentId: string) {
    const myLike = await this.findMyStatusForComment(new ObjectId(commentId), userIdFromToken)
    const status = DTO.likeStatus
    if (!myLike) {
      const dateOfCreation = new Date()
      const parentId = new ObjectId(commentId)
      const parentType = parentTypeEnum.comment
      const addedAt = dateOfCreation
      const userId = new ObjectId(userIdFromToken)


      const newLikeToCreate: APILike = {
        parentId: parentId,
        parentType: parentType,
        addedAt: addedAt,
        userId: userId,
        login: login,
        status: status,
        isHiden : false
      }
      await this.likesModel.create({
        parentId: parentId,
        parentType: parentType,
        addedAt: addedAt,
        userId: userId,
        login: login,
        status: status,
        isHiden : false
      })
      return true
    } else {

      await this.changeMyLikeStatus(status, userIdFromToken,  commentId, parentTypeEnum.comment)

      return true
    }
  }

  async findLikesCountForSpecificComment(commentId: ObjectId) {
    const likes = await this.likesModel.find({ $and: [
        { parentId: commentId},
        {  parentType: parentTypeEnum.comment},
        { status: StatusTypeEnum.Like },
        {isHiden: false}
      ]})
      .lean().exec();
    return likes.length
  }

  async findDisikesCountForSpecificComment(commentId: ObjectId) {
    const dislikes = await this.likesModel.find({ $and: [
        {parentId: commentId},
        {parentType: parentTypeEnum.comment},
        {status: StatusTypeEnum.Dislike},
        {isHiden: false}]
    })
    return dislikes.length
  }

  async findMyStatusForSpecificComment(commentId: ObjectId, userIdAsString: string) {
    console.log(userIdAsString, "userIdAsString")
    const userId = this.common.tryConvertToObjectId(userIdAsString)
    console.log(userId, "after user id");
    if(!userId){
      console.log(userId, "нету юзер ай ди");
      return null

    }
    console.log("before filter");
    console.log({
      parentId: commentId,
      parentType: parentTypeEnum.comment,
      userId: userId
    }, "filter");
    const filter = {
      parentId: commentId,
      parentType: parentTypeEnum.comment,
      userId: userId
    }

    const result = await this.likesModel.findOne(filter);
    console.log(result, "result");
    return result

  }

  async makeLikesHiden(userId: string) {
    await this.likesModel.updateMany({userId: new ObjectId(userId)},{$set : {isHiden : true}})
  }
  async makeLikesVisible(userId: string) {
    await this.likesModel.updateMany({userId: new ObjectId(userId)},{$set : {isHiden : false}})
  }
}
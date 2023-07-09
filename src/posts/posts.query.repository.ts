import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { APIComment, APIPost, Blog, BlogDocument } from "../mongo/mongooseSchemas";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";
import { paginationCriteriaType } from "../appTypes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(APIPost.name) private postsModel: Model<APIPost>,
              @InjectModel(Blog.name) private blogsModel: Model<Blog>,
              @InjectModel(APIComment.name) private commentsModel: Model<APIComment>,
              protected readonly common: Common,
              protected readonly likeRepository: LikeRepository,
  ) {
  }

  async createNewPost(DTO: any) {
    const blogId = this.common.tryConvertToObjectId(DTO.blogId)
    const createdAt = new Date()
    if(!blogId){
      return null
    }
    const blog = await this.blogsModel.findOne({ _id: new ObjectId(blogId) })
    if(!blog) return null;
    const newPost = {
      title: DTO.title, //    maxLength: 30
      shortDescription: DTO.shortDescription, //maxLength: 100
      content: DTO.content, // maxLength: 1000
      blogId: new ObjectId(blogId),
      blogName: blog.name,
      createdAt: createdAt,
    }
    const createdPost = await this.postsModel.create(newPost)
    return {
      id: createdPost._id,
      title: DTO.title, //    maxLength: 30
      shortDescription: DTO.shortDescription, //maxLength: 100
      content: DTO.content, // maxLength: 1000
      blogId: new ObjectId(blogId),
      blogName: blog.name,
      createdAt: createdAt,
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    }

  }


  async getListOfPostsIdsByBlogs(listOfBlogsForSpecifiedUser: string[]) {
    let postIdArray = []
    for (let blogId of listOfBlogsForSpecifiedUser) {
      const posts = await this.postsModel.find({blogId : new ObjectId(blogId)}, {_id : 1})
      postIdArray.push(...posts.map(item => item._id))
    }
    return postIdArray
  }
  async getListOfPostsByBlogs(listOfBlogsForSpecifiedUser: string[]) {
    let postIdArray = []
    for (let blogId of listOfBlogsForSpecifiedUser) {
      const posts = await this.postsModel.find({blogId : new ObjectId(blogId)})
      postIdArray.push(...posts)
    }
    return postIdArray
  }
}
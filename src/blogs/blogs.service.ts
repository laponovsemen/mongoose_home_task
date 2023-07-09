import { BlogsRepository } from './blogs.repository';
import { paginationCriteriaType } from '../appTypes';
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { ObjectId } from "mongodb";
import { LikeRepository } from "../likes/likes.repository";

@Injectable()
export class BlogsService {
  constructor(protected readonly blogsRepository: BlogsRepository,
              protected readonly authService : AuthService,
              protected readonly likeRepository : LikeRepository){}

  getAllBlogs(paginationCriteria) {
    return this.blogsRepository.getAllBlogs(paginationCriteria);
  }

  async getAllPostsForSpecificBlog(paginationCriteria: paginationCriteriaType, blogId: string, token: string) {
    const user = await this.authService.getUserByToken(token)
    console.log(user, 'user');


    const allPostsFrames = await this.blogsRepository.getAllPostsForSpecificBlog(paginationCriteria, blogId );
    if(!allPostsFrames){
      return null
    }
    for(let i = 0; i < allPostsFrames.items.length; i++){
      const post = allPostsFrames.items[i]
      const postId = new ObjectId(post.id)
      allPostsFrames.items[i].extendedLikesInfo.likesCount = await this.likeRepository.findLikesCountForSpecificPost(postId)
      allPostsFrames.items[i].extendedLikesInfo.dislikesCount = await this.likeRepository.findDisikesCountForSpecificPost(postId)
      // @ts-ignore
      allPostsFrames.items[i].extendedLikesInfo.newestLikes = await this.likeRepository.findNewestLikesForSpecificPost(postId)

    }
    if(!user){
      //console.log("i am out");
      //console.log(user, "user");
      return allPostsFrames
    } else {
      console.log("i am in ");
      const userId = user._id.toString()
      //console.log(userId, " id of user ");
      for(let i = 0; i < allPostsFrames.items.length; i++){
        const post = allPostsFrames.items[i]
        const postId = new ObjectId(post.id)

        const myLike = await this.likeRepository.findMyStatusForSpecificPost(postId, userId)
        console.log(myLike , "myLike");
        //console.log(postId , "postId");
        allPostsFrames.items[i].extendedLikesInfo.myStatus = myLike ? myLike.status : "None"
      }

      return allPostsFrames
    }
  }
  getBlogById(id: string) {
    return this.blogsRepository.getBlogById(id);
  }
  updateBlogById(DTO: any, id: string) {
    console.log("we are in updateBlogById in blogs.service");
    return this.blogsRepository.updateBlogById(DTO, id);
  }
  deleteBlogById(id: string) {
    return this.blogsRepository.deleteBlogById(id);
  }
  createPostForSpecificBlog(DTO: any, blogId: string) {
    return this.blogsRepository.createPostForSpecificBlog(DTO, blogId);
  }

  createNewBlog(DTO: any, user : any) {
    return this.blogsRepository.createNewBlog(DTO,user);
  }

  async getBlogByIdWithBloggerInfo(id) {
    return this.blogsRepository.getBlogByIdWithBloggerInfo(id);
  }
}

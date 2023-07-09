import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { APIComment, APIPost, CommentsDocument } from "../mongo/mongooseSchemas";
import { ObjectId } from "mongodb";
import { CommentForSpecifiedPostDTO } from "../input.classes";
import { Common } from "../common";
import { LikeRepository } from "../likes/likes.repository";

@Injectable()
export class CommentsQueryRepository{
  constructor(@InjectModel(APIComment.name) private  commentsModel : Model<CommentsDocument>,
              protected readonly common : Common,
              protected readonly likeRepository : LikeRepository,
  ) {
  }
  async deleteAllData(){
    await this.commentsModel.deleteMany({})
  }

  async getListOfCommentsByPostIds(paginationCriteria : any,
                                   listOfPostsForBlogs: APIPost[],
                                   listOfPostsIdsForBlogs: ObjectId[]
  ){
    console.log( "i`m in getListOfCommentsByPostIds");
    const pageSize = paginationCriteria.pageSize;
    const totalCount = await this.commentsModel.countDocuments({postId : {$in: listOfPostsIdsForBlogs }});
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = paginationCriteria.pageNumber;
    const sortBy = paginationCriteria.sortBy;
    const sortDirection: 'asc' | 'desc' = paginationCriteria.sortDirection;
    const ToSkip =
      paginationCriteria.pageSize * (paginationCriteria.pageNumber - 1);
    console.log(listOfPostsForBlogs, "list of posts nhui");
    const result = await this.commentsModel
      .find( {postId : {$in: listOfPostsIdsForBlogs }}) //
      .sort({ [sortBy]: sortDirection })
      .skip(ToSkip)
      .limit(pageSize);
    console.log(result, " result in getListOfCommentsByPostIds");
    console.log(result, "blyat");


    const array = {
      pageSize: pageSize,
      totalCount: totalCount,
      pagesCount: pagesCount,
      page: page,
      items: result.map(item => this.common.mongoPostAndCommentCommentSlicing(item, listOfPostsForBlogs)),
    };
    return array
  }


}
import { BanBlogDTO, BanUserDTO } from "../../input.classes";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityDevicesRepository } from "../../security.devices/security.devices.repository";
import { LikeRepository } from "../../likes/likes.repository";
import { CommentsRepository } from "../../comments/comments.repository";
import { paginationCriteriaType } from "../../appTypes";
import { Common } from "../../common";
import { BlogsRepository } from "../blogs.repository";
import { PostsRepository } from "../../posts/posts.repository";
import { BlogsQueryRepository } from "../blogs.query.repository";
import { PostsQueryRepository } from "../../posts/posts.query.repository";
import { CommentsQueryRepository } from "../../comments/comments.query.repository";

export class GetAllCommentForUserCommand{
  constructor(public queryParams : any,
              public userFromToken : any
  ) {
  }
}
@CommandHandler(GetAllCommentForUserCommand)
export class GetAllCommentForUserUseCase implements ICommandHandler<GetAllCommentForUserCommand>{
  constructor(
    protected securityDevicesRepository: SecurityDevicesRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected common: Common,
  ) {

  }
  async execute(command : GetAllCommentForUserCommand) {

    const paginationCriteria: paginationCriteriaType = this.common.getPaginationCriteria(command.queryParams);
    const listOfBlogsForSpecifiedUser = await this.blogsQueryRepository.getListOfBlogsByUserId(command.userFromToken.userId)
    const listOfPostsIdsForBlogs = await this.postsQueryRepository.getListOfPostsIdsByBlogs(listOfBlogsForSpecifiedUser)
    const listOfPostsForBlogs = await this.postsQueryRepository.getListOfPostsByBlogs(listOfBlogsForSpecifiedUser)
    const listOfAllCommentsForSuchPosts = await this.commentsQueryRepository.getListOfCommentsByPostIds(paginationCriteria,listOfPostsForBlogs, listOfPostsIdsForBlogs)
    console.log(listOfPostsForBlogs , " listOfPostsForBlogs");
    console.log(listOfPostsIdsForBlogs , "listOfPostsIdsForBlogs");
    console.log(listOfBlogsForSpecifiedUser , "listOfBlogsForSpecifiedUser");
    console.log(listOfAllCommentsForSuchPosts , "listOfAllCommentsForSuchPosts");

    return listOfAllCommentsForSuchPosts
  }
}

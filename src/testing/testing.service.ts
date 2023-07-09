import { Injectable } from "@nestjs/common";
import { BlogsRepository } from "../blogs/blogs.repository";
import { CommentsRepository } from "../comments/comments.repository";
import { UsersRepository } from "../users/users.reposiroty";
import { PostsRepository } from "../posts/posts.repository";
import { LikeRepository } from "../likes/likes.repository";
import { SecurityDevicesRepository } from "../security.devices/security.devices.repository";
import { BansRepository } from "../blogs/bans.repository";


@Injectable()
export class TestingService {
  constructor(private readonly blogsRepository: BlogsRepository,
              private readonly postsRepository: PostsRepository,
              private readonly usersRepository: UsersRepository,
              private readonly commentsRepository: CommentsRepository,
              private readonly likeRepository: LikeRepository,
              private readonly bansRepository: BansRepository,
              private readonly securityDevicesRepository: SecurityDevicesRepository,
              ) {
  }
  async  deleteAllData(){
    await this.blogsRepository.deleteAllData()
    await this.postsRepository.deleteAllData()
    await this.usersRepository.deleteAllData()
    await this.commentsRepository.deleteAllData()
    await this.likeRepository.deleteAllData()
    await this.securityDevicesRepository.deleteAllData()
    await this.bansRepository.deleteAllData()
  }
}
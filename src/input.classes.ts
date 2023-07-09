import {
  IS_UUID,
  IsBoolean, IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNotIn,
  IsObject,
  IsString,
  IsUrl, IsUUID, isUUID,
  Length,
  Matches,
  Validate
} from "class-validator";
import { Transform } from "class-transformer";
import { StatusTypeEnum } from "./mongo/mongooseSchemas";
import { BlogIdExistsRule } from "./auth/custom.validators/blogIdExists.validator";
import { ObjectId } from "mongodb";
import {  IsObjectIdValidator } from "./auth/custom.validators/isObjectId.validator";

export class CommentForSpecifiedPostDTO{
  @Length(20, 300)
  @IsNotEmpty()
  @IsString()
  content : string // string minLength: 20 maxLength: 300
}

export class LikeStatusDTO {
  @IsEnum(StatusTypeEnum)
  //@IsNotIn(["None", "Like", "Dislike"])
  likeStatus : StatusTypeEnum
}
export class PostForSpecificBlogDTO{
  @Transform(item => item.value.trim() )
  @IsNotEmpty()
  @Length(1, 30)
  title: string //maxLength: 30

  @Transform(item => item.value.trim() )
  @IsNotEmpty()
  @Length(1, 100)
  shortDescription: string // maxLength: 100

  @Transform(item => item.value.trim() )
  @IsNotEmpty()
  @Length(1, 1000)
  content: string // maxLength: 1000
}


export class BlogDTO {
  @IsDefined()
  @Transform(item => item.value.trim())
  @IsNotEmpty()
  @Length(1, 15)
  name : string // maxLength: 15
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(1, 500)
  description: string // maxLength: 500
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @Length(1, 100)
  websiteUrl : string // maxLength: 100 pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
}

export class PostDTO {
  @Transform(item => item.value.trim() )
  @IsNotEmpty()
  @Length(1, 30)
  title: string //maxLength: 30
  @Transform(item => item.value.trim() )
  @IsNotEmpty()
  @Length(1, 100)
  shortDescription: string // maxLength: 100
  @Transform(item => item.value.trim() )
  @IsNotEmpty()
  @Length(1, 1000)
  content: string // maxLength: 1000
  @Transform(item => item.value.trim() )
  @IsNotEmpty()
  @Validate(BlogIdExistsRule)
  blogId: string
}
export class BanUserDTO {
  @IsBoolean()
  isBanned: boolean //maxLength: 30

  @IsNotEmpty()
  @Length(20)
  banReason: string // maxLength: 100

}
export class BanBlogDTO {
  @IsBoolean()
  isBanned: boolean //maxLength: 30
}

export class UserDTO {
  @IsNotEmpty()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login : string //maxLength: 10 minLength: 3 pattern: ^[a-zA-Z0-9_-]*$

  @IsNotEmpty()
  @Length(6, 20)
  password: string // maxLength: 20 minLength: 6
  @IsNotEmpty()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email : string // pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
}
export class BanUserByBloggerDTO {
  @IsBoolean()
  isBanned: boolean //<-- tut oshybka byla
  @IsNotEmpty()
  @Length(20)
  banReason: string
  @IsNotEmpty()
  @Validate(IsObjectIdValidator)
  blogId: string
}


export class LoginDTO {
  @IsNotEmpty()
  loginOrEmail : string //maxLength: 10 minLength: 3 pattern: ^[a-zA-Z0-9_-]*$

  @IsNotEmpty()
  @Length(6, 20)
  password: string // maxLength: 20 minLength: 6
}
export class emailDTO {
  @IsNotEmpty()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email : string //maxLength: 10 minLength: 3 pattern: ^[a-zA-Z0-9_-]*$

}
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable, NotFoundException,
  UnauthorizedException, UseGuards
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { request, Request } from "express";
import { jwtConstants } from "./constants";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";
import { BlogsRepository } from "../blogs/blogs.repository";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    //console.log(this.jwtService, " jwtService");
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    //console.log(request, "request");
    //console.log(token, " token");

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secretForAccess
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request["user"] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor() {
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const [authType, authValue] = auth.split(" ");
    if (authType !== "Basic") throw new UnauthorizedException();
    if (authValue !== "YWRtaW46cXdlcnR5") throw new UnauthorizedException();
    return true;
  }


}
export class AllPostsForSpecificBlogGuard implements CanActivate {
  constructor(protected readonly blogsRepository : BlogsRepository,protected reflector: Reflector) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedException();
    const [authType, authValue] = auth.split(" ");
    if (authType !== "Basic") throw new UnauthorizedException();
    if (authValue !== "YWRtaW46cXdlcnR5") throw new UnauthorizedException();
    const blogId = req.params.id
    console.log(blogId, " blogId");
    const foundBlog = await this.blogsRepository.getBlogById(blogId)
    console.log(foundBlog, "foundBlog");

    return true;
  }


}
@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
  constructor(protected jwtService : JwtService) {

  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const req = context.switchToHttp().getRequest();
      const refreshTokenInCookie = req.cookies.refreshToken
      console.log(refreshTokenInCookie);
      if (!refreshTokenInCookie){
        console.log("refreshTokenInCookie is present");
        throw new BadRequestException();
      }

      const result = this.jwtService.verify(refreshTokenInCookie, {secret : jwtConstants.secretForRefresh})
      if (!result) {
        console.log("refreshTokenInCookie is not verified");
        throw new NotFoundException();

      }
      req.refreshToken = refreshTokenInCookie
      return true
    } catch (e) {
      console.log(e);
      console.log("refreshTokenInCookie is not present")
      throw new UnauthorizedException()
    }

  }


}
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { Request, Response } from "express";
import { SecurityDevicesRepository } from "./security.devices.repository";
import { SecurityDevicesService } from "./security.devices.service";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard, RefreshTokenAuthGuard } from "../auth/auth.guard";
import { ObjectId } from "mongodb";
import { AuthService } from "../auth/auth.service";
import { APISession, User } from "../mongo/mongooseSchemas";
import { SkipThrottle } from "@nestjs/throttler";

@Controller("security/devices")
export class SecurityDevicesController{
  constructor(protected readonly securityDevicesService : SecurityDevicesService,
              protected readonly securityDevicesRepository : SecurityDevicesRepository,
              protected readonly authService : AuthService,
              protected readonly jwtService : JwtService) {
  }
  @SkipThrottle()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllDevicesForCurrentUser(@Req() req: Request,
                                    @Res({ passthrough: true }) res: Response,
                                    @Query() QueryParams,) {
    const refreshToken = req.cookies.refreshToken

    const result = await this.securityDevicesService.getAllDevicesForCurrentUser(refreshToken)
    if (!result) {
      throw new UnauthorizedException()
    }
    return result
  }

  @SkipThrottle()
  @UseGuards(RefreshTokenAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllOtherDevices (@Req() req: Request,
                          @Res({ passthrough: true }) res: Response){

    const refreshToken : string = req.cookies.refreshToken
    const refreshTokenPayload: any = this.jwtService.decode(refreshToken)
    const deviceIdFromRefreshToken : string = refreshTokenPayload!.deviceId
    const userIdFromRefreshToken : ObjectId = new ObjectId(refreshTokenPayload!.userId)
    await this.securityDevicesRepository.deleteAllDevicesExcludeCurrentDB(userIdFromRefreshToken, deviceIdFromRefreshToken)
    return
  }
  @SkipThrottle()
  @Delete(":deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById (@Req() req: Request,
                          @Res({ passthrough: true }) res: Response,
                          @Param("deviceId") deviceId : string){
    if (!deviceId){
      throw new NotFoundException()
    }
    const foundDevice : APISession = await this.securityDevicesRepository.findDeviceById(deviceId)
    if(!foundDevice) throw new NotFoundException();

    const userFromToken : User  = await this.authService.getUserByRefreshToken(req.cookies.refreshToken)
    if(!userFromToken) throw new UnauthorizedException()

    if(foundDevice.userId.toString() !== userFromToken!._id.toString()) throw new ForbiddenException();

    //const userIdFromDb =
    return await this.securityDevicesRepository.deleteDeviceById(deviceId)
  }
}
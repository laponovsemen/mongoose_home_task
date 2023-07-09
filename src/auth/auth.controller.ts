import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus, Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Headers
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { AuthGuard, RefreshTokenAuthGuard } from "./auth.guard";
import { emailDTO, LoginDTO, UserDTO } from "../input.classes";
import { JwtService } from "@nestjs/jwt";
import { SecurityDevicesRepository } from "../security.devices/security.devices.repository";
import { UsersService } from "../users/users.service";
import { Common } from "../common";
import { ObjectId } from "mongodb";
import { jwtConstants } from "./constants";
import { RefreshToken } from "./decorators/public.decorator";


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              protected readonly jwtService : JwtService,
              protected readonly common : Common,
              protected readonly usersService : UsersService,
              protected readonly securityDevicesRepository : SecurityDevicesRepository,
              ) {}

  @Post('password-recovery')
  @HttpCode(HttpStatus.OK)
  passwordRecovery(@Body() signInDto: Record<string, any>) {
  }

  @Post('new-password')
  @HttpCode(HttpStatus.OK)
  newPassword(@Body() signInDto: Record<string, any>) {
  }
  //@UseGuards(AuthGuard)

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req : Request,
              @Res() res: Response,
              @Body() signInDto: LoginDTO,
    @Headers("user-agent") deviceName = 'unknown',
    @Ip() ip: string,
  ) {
    const lastActiveDate = new Date()
    const deviceId = new ObjectId(this.common.mongoObjectId())
    const user = await this.usersService.findUserByLoginOrEmail(signInDto.loginOrEmail, signInDto.password);
    console.log(user?.banInfo.isBanned , " is user banned");
    //console.log(user)
    if (user?.password !== signInDto.password || user?.banInfo.isBanned) {

      throw new UnauthorizedException();
    }


    const result = await this.authService.signIn(user, ip, deviceName, deviceId);
    const newSession = await this.securityDevicesRepository.createNewSession(user._id.toString(),
      ip,
      deviceName,
      lastActiveDate,
      deviceId,
      result.refresh_token)

    res.cookie('refreshToken', result.refresh_token, { httpOnly: true, secure: true })
    res.status(200).send({
      accessToken: result.access_token
    })
  }
  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request,
                     @Res() res: Response,
                     @RefreshToken() refreshToken) {
    console.log(refreshToken);

    const result = await this.authService.refreshToken(refreshToken)
    if (!result) {
      res.status(401).json({})
      return
    }

    res.cookie('refreshToken', result.refresh_token, { httpOnly: true, secure: true })
    res.status(200).send({
      accessToken: result.access_token
    })
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Res() res : Response,
                                 @Body() codeDTO: {code : string}) {
    const result = await this.authService.registrationConfirmation(codeDTO)
    if(!result){
      res.status(400).json({errorsMessages: [{ message: "Code already confirmed", field: "code" }]})
      return
    }
      res.status(204).json({})

  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Res() res : Response,
    @Body() userDTO: UserDTO) {
    const result = await this.authService.registration(userDTO)
    if(!result.result){
      return res.status(400).json({ errorsMessages: [{ message: "email already confirmed", field: result.field }] })

    }
    return res.status(204).json({})

  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Res() res: Response,
                                   @Body() email: emailDTO) {
    const result = await this.authService.registrationEmailResending(email)
    if (!result.result) {
      res.status(HttpStatus.BAD_REQUEST).json({errorsMessages: [{ message: result.message, field: result.field }]})
    }
    res.status(HttpStatus.NO_CONTENT).json({})

  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request,
               @Res({ passthrough: true }) res: Response) {
    console.log(req.cookies, " Cookies in the Post Logout Procedure")
    //console.log(req, "All request Params in the Post Logout Procedure")
    const refreshToken = req.cookies.refreshToken


    const result = await this.authService.logout(refreshToken)
    if (!result) {
      throw new UnauthorizedException()
    }
    return result
  }


  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Res({passthrough : true}) res: Response,
                   @Req() req : Request) {
    const accessToken = req.headers.authorization
    //const refreshToken = req.cookies.refreshToken
    const refreshTokenValidation = this.authService.verifyRefreshToken(accessToken)
    if (!refreshTokenValidation) {
      throw new UnauthorizedException()
    }
    const result = await this.authService.getUserByToken(accessToken);
    console.log(result, "result");

    return {
      userId : result._id,
      email : result.email,
      login : result.login
    }
  }
}
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, HttpStatus,
  NotFoundException,
  Param,
  Post, Put,
  Query, Req, Res,
  UseGuards
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { paginationCriteriaType } from "../appTypes";
import { Common } from "../common";
import { BasicAuthGuard } from "../auth/auth.guard";
import { BanUserDTO, UserDTO } from "../input.classes";
import { SkipThrottle } from "@nestjs/throttler";
import { Response } from "express";
import { BanProcedureCommand } from "./use-cases/banProcedure-use-case";
import { CommandBus } from "@nestjs/cqrs";
import { GettingAllUsersForSuperAdminCommand } from "./use-cases/getting-all-users-for-super-admin";




@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller('/sa/users')
export class SAUsersController{
  constructor(protected readonly usersService : UsersService,
              protected readonly commandBus : CommandBus,
              protected readonly common : Common) {
  }

  @Put(":userId/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUnbanUser(@Param("userId") userId,
                     @Req() req : Request,
                     @Res({passthrough : true}) res : Response,
                     @Body() DTO : BanUserDTO
                     ){

    return this.commandBus.execute( new BanProcedureCommand(userId, DTO))
    //return {}
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() QueryParams){
    return this.commandBus.execute( new GettingAllUsersForSuperAdminCommand(QueryParams))
  }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() DTO : UserDTO){
    return await this.usersService.createUser(DTO)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param("id") id){
    const result = await this.usersService.deleteUserById(id)
    if (!result){
      throw new NotFoundException("not found")
    }
    return
  }
}
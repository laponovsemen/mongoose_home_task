

import { Controller, Delete, HttpCode } from "@nestjs/common";
import { Common } from "../common";
import { BlogsRepository } from "../blogs/blogs.repository";
import { TestingService } from "./testing.service";

@Controller('testing/all-data')
export class TestingController {
  constructor(

    private readonly testingService: TestingService,

  ) {}

  @Delete()
  @HttpCode(204)
  async deleteAllData(){
    await this.testingService.deleteAllData()
  }


}
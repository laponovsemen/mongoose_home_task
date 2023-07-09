import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Injectable } from "@nestjs/common";
import { BlogsRepository } from "../../blogs/blogs.repository";

@ValidatorConstraint({  async: true })
@Injectable()
export class BlogIdExistsRule implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}

  async validate(value: string) {
    try {
      console.log(this.blogsRepository, 'br');
      return !!await this.blogsRepository.getBlogById(value);
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog doesnt exist with such id`;
  }
}
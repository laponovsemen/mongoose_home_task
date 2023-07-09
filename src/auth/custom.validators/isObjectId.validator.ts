import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Injectable } from "@nestjs/common";
import { BlogsRepository } from "../../blogs/blogs.repository";
import { ObjectId } from "mongodb";

@ValidatorConstraint({  async: true })
@Injectable()
export class IsObjectIdValidator implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string) {
    try {
      const id = new ObjectId(value)
      if(!id) return false;
      return true
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `field is not ObjectId`;
  }
}
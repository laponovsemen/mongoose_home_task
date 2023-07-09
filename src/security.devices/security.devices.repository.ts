import { Injectable, Session } from "@nestjs/common";
import { InjectModel, Prop } from "@nestjs/mongoose";
import {
  APIComment,
  APIDeviceModel,
  APISession,
  CommentsDocument,
  DeviceModelSchema,
  SessionDocument
} from "../mongo/mongooseSchemas";
import { Model } from "mongoose";
import { ObjectId } from "mongodb";

@Injectable()
export class SecurityDevicesRepository {
    constructor(@InjectModel(APISession.name) private  sessionModel : Model<SessionDocument>) {

    }


  async createNewSession(userId: string, ip: string, title: string, lastActiveDate: Date, deviceId : ObjectId, refreshToken : string) {
      const device = {
        ip:	ip, // IP address of device during signing in
        title:	title, // Device name: for example Chrome 105 (received by parsing http header "user-agent")
        lastActiveDate:	lastActiveDate.toISOString(), // Date of the last generating of refresh/access tokens
        deviceId:	deviceId, //  Id of connected device session
      }
    return await this.sessionModel.create({
      userId: new ObjectId(userId),
      device: device,
      refreshToken: refreshToken,
    })
  }

  async updateSessionByDeviceId(deviceId: string, lastActiveDate: Date, newRefreshToken: string) {
    const updatedSession = await this.sessionModel.updateOne({"device.deviceId": deviceId},
      {$set: {
          "device.lastActiveDate" : lastActiveDate.toISOString(),
          refreshToken : newRefreshToken
        }})
    return
  }

  async deleteDeviceById(deviceId: string) {
      const deletedSession = await this.sessionModel.deleteOne({ "device.deviceId": new ObjectId(deviceId) });
      return deletedSession.deletedCount === 1
  }

  async getAllDevicesForCurrentUser(userId: string) {
      return this.sessionModel.find({userId : new ObjectId(userId)})
  }

  async gedDeviceByDeviceId(deviceId: string) {
      return this.sessionModel.findOne({ "device.deviceId": new ObjectId(deviceId) });

  }

  async deleteAllDevicesExcludeCurrentDB(userIdFromRefreshToken: ObjectId, deviceIdFromRefreshToken: string) {
      return this.sessionModel.deleteMany({
        $and: [
          { userId: userIdFromRefreshToken },
          {"device.deviceId" : {$ne: deviceIdFromRefreshToken}}
        ]
      });

  }

  async findDeviceById(deviceId: string) {
    return this.sessionModel.findOne({"device.deviceId" : deviceId})
  }

  async deleteAllData() {
    await this.sessionModel.deleteMany({})
  }

  async deleteAllSessionsForSpecifiedUser(userId: string) {
    await this.sessionModel.deleteMany({userId : userId})
  }
}
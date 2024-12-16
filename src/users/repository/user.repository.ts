import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserEntity } from "../entity/users.entity";
import type { Model } from "mongoose";
import type { UserDocument } from "../schemas/users.schema";

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(UserEntity.name)
        private readonly localModel: Model<UserDocument>
    ) {}

    async createUser(user: UserEntity): Promise<UserEntity> {
        const newUser = await this.localModel.create(user)
        return newUser
    }
}

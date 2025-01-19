import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntity } from '../entity/users.entity';
import type { Model } from 'mongoose';
import type { UserDocument } from '../schemas/users.schema';

@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(UserEntity.name)
		private readonly userModel: Model<UserDocument>,
	) {}

	async createUser(user: UserEntity): Promise<UserEntity> {
		const newUser = (await this.userModel.create(user)).save();
		return newUser;
	}

	async getUserById(id: string): Promise<UserEntity> {
		const user = await this.userModel.findById(id).exec();
		return user;
	}

	async getUserByCpf(cpf: string): Promise<UserEntity> {
		const user = await this.userModel.findOne({ cpf }).exec();
		return user;
	}

	async getUserByEmail(email: string): Promise<UserEntity> {
		const user = await this.userModel.findOne({ email }).exec();
		return user;
	}

	async deleteUserById(id: string): Promise<void> {
		await this.userModel.deleteOne({ _id: id }).exec();
	}

	async findUserByIdAndUpdate(
		id: string,
		newUserData: object,
	): Promise<UserEntity> {
		const findUserAndUpdate = await this.userModel.findByIdAndUpdate(
			id,
			newUserData,
			{
				new: true,
			},
		);

		return findUserAndUpdate;
	}
}

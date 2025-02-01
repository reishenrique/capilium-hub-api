import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entity/users.entity';
import type { Model } from 'mongoose';
import type { UserDocument } from '../schemas/users.schema';

@Injectable()
export class UserRepository {
		constructor(
			@InjectModel(User.name)
			private readonly userModel: Model<UserDocument>,
		) {}

		async createUser(user: User): Promise<User> {
			const newUser = (await this.userModel.create(user)).save();
			return newUser;
		}

		async findUserById(id: string): Promise<Omit<User, 'password'>> {
			const user = await this.userModel.findById(id).exec();
			return user;
		}

		async findUserByCpf(cpf: string): Promise<Omit<User, 'password'>> {
			const user = await this.userModel.findOne({ cpf }).exec();
			return user;
		}

		async findUserByEmail(email: string): Promise<User> {
			const user = await this.userModel.findOne({ email }).exec();
			return user;
		}

		async deleteUserById(id: string): Promise<void> {
			await this.userModel.deleteOne({ _id: id }).exec();
		}

		async findUserByIdAndUpdate(
			id: string,
			newUserData: object,
		): Promise<User> {
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

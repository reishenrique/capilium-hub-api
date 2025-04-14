import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../users/entity/users.entity';
import { Model } from 'mongoose';
import { UserDocument } from '../../users/schemas/users.schema';

@Injectable()
export class UploadRepository {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>,
	) {}

	async updateResume(id: string, resumeFileName: string): Promise<void> {
		await this.userModel
			.findByIdAndUpdate(id, { resume: resumeFileName })
			.exec();
	}
}

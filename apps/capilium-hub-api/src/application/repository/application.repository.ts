import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Application } from '../entity/application.entity';
import { Model, Types } from 'mongoose';
import { ApplicationDocument } from '../schemas/applications.schema';

@Injectable()
export class ApplicationRepository {
	constructor(
		@InjectModel(Application.name)
		private readonly applicationModel: Model<ApplicationDocument>,
	) {}

	async createApplication(
		opportunityId: string,
		userId: string,
	): Promise<Application> {
		const createApplication = (
			await this.applicationModel.create({
				opportunityId: new Types.ObjectId(opportunityId),
				userId: new Types.ObjectId(userId),
			})
		).save();

		return createApplication;
	}

	async hasAppliedToOpportunity(
		opportunityId: string,
		userId: string,
	): Promise<Application> {
		const hasApplied = await this.applicationModel
			.findOne({
				opportunityId,
				userId,
			})
			.exec();

		return hasApplied;
	}

	async addUserToApplication(opportunityId: string, userId: string) {
		return await this.applicationModel.findOneAndUpdate(
			{ opportunityId },
			{ $addToSet: { userIds: userId } },
			{ new: true, upsert: true },
		);
	}

	async listApplicationByUser(id: string): Promise<Application> {
		const application = await this.applicationModel.findOne({ _id: id }).exec();
		return application;
	}

	async listApplicationByOpportunity(id: string): Promise<Application> {
		const application = await this.applicationModel.findOne({ _id: id }).exec();
		return application;
	}

	async listApplicationById(id: string) {
		const application = await this.applicationModel.findOne({ _id: id }).exec();
		return application;
	}

	async deleteApplication(applicationId: string): Promise<void> {
		await this.applicationModel.deleteOne({ _id: applicationId }).exec();
	}
}

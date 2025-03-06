import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Application } from '../entity/application.entity';
import { Model } from 'mongoose';
import { ApplicationDocument } from '../schemas/applications.schema';

@Injectable()
export class ApplicationRepository {
	constructor(
		@InjectModel(Application.name)
		private readonly applicationModel: Model<ApplicationDocument>,
	) {}

	// WIP
	async createApplication(
		userId: string,
		opportunityId: string,
	): Promise<Application> {}

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
}

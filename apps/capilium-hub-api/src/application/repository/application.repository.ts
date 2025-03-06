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

}

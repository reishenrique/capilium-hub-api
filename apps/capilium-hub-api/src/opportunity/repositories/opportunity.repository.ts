import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Opportunity } from '../entity/opportunity.entity';
import { Model } from 'mongoose';
import { OpportunityDocument } from '../schemas/opportunity.schema';

@Injectable()
export class OpportunityRepository {
	constructor(
		@InjectModel(Opportunity.name)
		private readonly opportunityModel: Model<OpportunityDocument>,
	) {}

	async findOpportunityById(id: string): Promise<Opportunity> {
		const opportunity = await this.opportunityModel.findById(id).exec();
		return opportunity;
	}

	async createOpportunity(opportunity: Opportunity): Promise<Opportunity> {
		const newOpportunity = (
			await this.opportunityModel.create(opportunity)
		).save();
		return newOpportunity;
	}
}

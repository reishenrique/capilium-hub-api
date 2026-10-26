import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatusEnum } from '../../common/enums/status.enum';
import { Opportunity } from '../entity/opportunity.entity';
import { OpportunityDocument } from '../schemas/opportunity.schema';

@Injectable()
export class OpportunityRepository {
	constructor(
		@InjectModel(Opportunity.name)
		private readonly opportunityModel: Model<OpportunityDocument>,
	) {}

	async findOpportunityById(id: string): Promise<OpportunityDocument | null> {
		const opportunity = await this.opportunityModel.findById(id).exec();
		return opportunity;
	}

	async create(opportunity: Opportunity): Promise<OpportunityDocument> {
		const newOpportunity = (
			await this.opportunityModel.create(opportunity)
		).save();
		return newOpportunity;
	}

	async findAllOpenedOpportunities(): Promise<OpportunityDocument[] | []> {
		const openOpportunityes = await this.opportunityModel.find({
			status: StatusEnum.Open,
		});

		return openOpportunityes;
	}

	async deleteOpportunity(id: string): Promise<void> {
		await this.opportunityModel.deleteOne({ _id: id }).exec();
	}

	async updateOpportunity(
		opportunity: OpportunityDocument,
		newOpportunityData: object,
	): Promise<OpportunityDocument> {
		opportunity.set(newOpportunityData);

		return await opportunity.save();
	}
}

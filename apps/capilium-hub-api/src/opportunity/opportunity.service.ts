import { Injectable, NotFoundException } from '@nestjs/common';
import { OpportunityResponseDto } from './dto/opportunityResponseDto';
import { OpportunityRepository } from './repositories/opportunity.repository';
import { OpportunityCreateDto } from './dto/opportunityCreateDto';

@Injectable()
export class OpportunityService {
	constructor(private readonly opportunityRepository: OpportunityRepository) {}

	async findOpportunityById(
		id: string,
	): Promise<Partial<OpportunityResponseDto>> {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(id);

		if (!opportunity) {
			throw new NotFoundException('Opportunity not found');
		}

		return opportunity;
	}

	async create(
		opportunity: OpportunityCreateDto,
	): Promise<Partial<OpportunityResponseDto>> {
		const newOpportunity = await this.opportunityRepository.create(opportunity);

		return newOpportunity;
	}
}

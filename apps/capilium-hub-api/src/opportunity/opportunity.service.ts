import { Injectable, NotFoundException } from '@nestjs/common';
import { OpportunityResponseDto } from './dto/opportunityResponseDto';
import { OpportunityRepository } from './repositories/opportunity.repository';

@Injectable()
export class OpportunityService {
	constructor(private readonly opportunityRepository: OpportunityRepository) {}

	async findOpportunityById(id: string): Promise<OpportunityResponseDto> {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(id);

		if (!opportunity) {
			throw new NotFoundException('Opportunity not found');
		}

		return opportunity;
	}
}

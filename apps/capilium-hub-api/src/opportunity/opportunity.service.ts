import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OpportunityResponseDto } from './dto/opportunityResponseDto';
import { OpportunityRepository } from './repositories/opportunity.repository';
import { OpportunityCreateDto } from './dto/opportunityCreateDto';

@Injectable()
export class OpportunityService {
	protected readonly _logger = new Logger('OpportunityService');
	constructor(private readonly opportunityRepository: OpportunityRepository) {}

	async findOpportunityById(
		id: string,
	): Promise<Partial<OpportunityResponseDto>> {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(id);

		if (!opportunity) {
			this._logger.error(`Opportunity ID: ${id} not found`);
			throw new NotFoundException('Opportunity not found');
		}

		return opportunity;
	}

	async findAllOpenedOpportunities(): Promise<OpportunityResponseDto[]> {
		const findOpportunities =
			await this.opportunityRepository.findAllOpenedOpportunities();

		if (!findOpportunities)
			throw new NotFoundException('No open opportunities');

		return findOpportunities;
	}

	async create(
		opportunity: OpportunityCreateDto,
	): Promise<Partial<OpportunityResponseDto>> {
		const newOpportunity = await this.opportunityRepository.create(opportunity);

		return newOpportunity;
	}

	async deleteOpportunityById(id: string): Promise<void> {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(id);

		if (!opportunity) {
			this._logger.error(`Opportunity ID: ${id} not found to delete`);
			throw new NotFoundException('Opportunity not found to delete');
		}

		await this.opportunityRepository.deleteOpportunity(id);
	}

	public async updateOpportunityById(
		id: string,
		newOpportunityData: object,
	): Promise<Partial<OpportunityResponseDto>> {
		const findOpportunityAndUpdate =
			await this.opportunityRepository.findOpportunityByIdAndUpdate(
				id,
				newOpportunityData,
			);

		if (!findOpportunityAndUpdate) {
			this._logger.error(`User with ID: ${id} not found to update`);
			throw new NotFoundException('User not found to update');
		}

		return findOpportunityAndUpdate;
	}
}

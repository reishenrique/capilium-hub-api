import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { OpportunityResponseDto } from './dto/opportunityResponseDto';
import { OpportunityRepository } from './repositories/opportunity.repository';
import { OpportunityCreateDto } from './dto/opportunityCreateDto';
import { UserRepository } from '../users/repository/user.repository';
import { StatusEnum } from '../common/enums/status.enum';

@Injectable()
export class OpportunityService {
	constructor(
		private readonly opportunityRepository: OpportunityRepository,
		private readonly userRepository: UserRepository,
	) {}

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

	// WIP > Thinking how can I check if user already apply on opportunity
	async applyAtOpportunity(userId: string, opportunityId: string) {
		const user = await this.userRepository.findUserById(userId);

		if (!user)
			throw new NotFoundException('User not found to opportunity apply');

		const opportunity =
			await this.opportunityRepository.findOpportunityById(opportunityId);

		if (!opportunity)
			throw new NotFoundException('Opportunity not found to user apply');

		if (opportunity.status !== StatusEnum.Open) {
			throw new BadRequestException('Opportunity is not open for applications');
		}
	}

	async deleteOpportunityById(id: string): Promise<void> {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(id);

		if (!opportunity) {
			throw new NotFoundException('Opportunity not found to delete');
		}

		await this.opportunityRepository.deleteOpportunity(id);
	}
}

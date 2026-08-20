import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { OpportunityResponseDto } from './dto/opportunityResponseDto';
import { OpportunityRepository } from './repositories/opportunity.repository';
import { OpportunityCreateDto } from './dto/opportunityCreateDto';
import EventEmitter2 from 'eventemitter2';
import { LogEventEnum } from '../logger/enum/log-event.enum';
import { LogLevelEnum } from '../logger/enum/log-level.enum';
import { UserRepository } from '../users/repository/user.repository';
import { ClinicRepository } from '../clinic/repository/clinic.repository';

@Injectable()
export class OpportunityService {
	protected readonly _logger = new Logger('OpportunityService');
	eventEmitter: EventEmitter2;
	constructor(
		private readonly opportunityRepository: OpportunityRepository,
		private readonly userRepository: UserRepository,
		private readonly clinicRepository: ClinicRepository,
	) {}

	async findOpportunityById(
		id: string,
	): Promise<Partial<OpportunityResponseDto>> {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(id);

		if (!opportunity) {
			this._logger.error(`Opportunity ID: ${id} not found`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Opportunity not found by id',
				context: 'OpportunityService',
				data: {
					id: id,
				},
			});

			throw new NotFoundException('Opportunity not found');
		}

		return opportunity;
	}

	async findAllOpenedOpportunities(): Promise<OpportunityResponseDto[]> {
		const findOpportunities =
			await this.opportunityRepository.findAllOpenedOpportunities();

		if (!findOpportunities) {
			this._logger.warn('There are no open opportunities on record');

			return [];
		}

		return findOpportunities;
	}

	async create(
		opportunity: OpportunityCreateDto,
		userId: string,
	): Promise<Partial<OpportunityResponseDto>> {
		const user = await this.userRepository.findUserById(userId);

		if (!user.isAdmin)
			throw new BadRequestException(
				'Only clinic administrators can create opportunities',
			);

		const clinic = await this.clinicRepository.findClinicByCnpj(user.clinicId);

		const opportunityPayload = {
			...opportunity,
			clinicName: clinic.clinicName,
		};

		const newOpportunity =
			await this.opportunityRepository.create(opportunityPayload);

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

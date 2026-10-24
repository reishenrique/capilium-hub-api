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
import { CacheService } from '../infrastructure/cache/cache.service';
import { CacheKeyEnum } from '../common/enums/cache-keys.enum';
import { OpportunityDocument } from './schemas/opportunity.schema';
import { toOpportunityResponseDto } from './mappers/opportunity.mappers';

@Injectable()
export class OpportunityService {
	protected readonly _logger = new Logger('OpportunityService');
	eventEmitter: EventEmitter2;
	constructor(
		private readonly opportunityRepository: OpportunityRepository,
		private readonly userRepository: UserRepository,
		private readonly clinicRepository: ClinicRepository,
		private readonly cacheService: CacheService,
	) {}

	async findOpportunityById(
		id: string,
	): Promise<Partial<OpportunityResponseDto>> {
		const cacheKey = `${CacheKeyEnum.OPPORTUNITY}:${id}`;

		const cachedOpportunity =
			await this.cacheService.get<OpportunityResponseDto>(cacheKey);

		if (!cachedOpportunity) {
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

			await this.cacheService.set(cacheKey, opportunity);

			return toOpportunityResponseDto(opportunity);
		}

		return cachedOpportunity;
	}

	async findAllOpenedOpportunities(): Promise<OpportunityResponseDto[]> {
		const cachedOpportunities = await this.cacheService.get<
			OpportunityResponseDto[]
		>(CacheKeyEnum.OPPORTUNITIES_OPENED);

		if (!cachedOpportunities) {
			const opportunities =
				await this.opportunityRepository.findAllOpenedOpportunities();

			if (!opportunities.length) {
				this._logger.warn('There are no open opportunities on record');

				return [];
			}

			const parsedOpportunities: OpportunityResponseDto[] = opportunities.map(
				(opportunity: OpportunityDocument) =>
					toOpportunityResponseDto(opportunity),
			);

			await this.cacheService.set<OpportunityResponseDto[]>(
				CacheKeyEnum.OPPORTUNITIES_OPENED,
				parsedOpportunities,
			);

			return parsedOpportunities;
		}

		return cachedOpportunities;
	}

	async create(
		opportunity: OpportunityCreateDto,
		userId: string,
	): Promise<Partial<OpportunityResponseDto>> {
		const user = await this.userRepository.findUserById(userId);

		if (!user) {
			this._logger.error(
				`User with ID: ${userId} not found to create opportunity`,
			);

			throw new NotFoundException('User not found');
		}

		if (!user.isAdmin)
			throw new BadRequestException(
				'Only clinic administrators can create opportunities',
			);

		if (!user.clinicId) {
			throw new BadRequestException('Administrator is not linked to a clinic');
		}

		const clinic = await this.clinicRepository.findClinicById(user.clinicId);

		if (!clinic) {
			this._logger.error(
				`Clinic with ID: ${user.clinicId} not found to create opportunity`,
			);

			throw new NotFoundException('Clinic not found');
		}

		const opportunityPayload = {
			...opportunity,
			clinicName: clinic.clinicName,
			clinicId: clinic._id.toString(),
		};

		const newOpportunity =
			await this.opportunityRepository.create(opportunityPayload);

		return toOpportunityResponseDto(newOpportunity);
	}

	async deleteOpportunityById(id: string): Promise<void> {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(id);

		if (!opportunity) {
			this._logger.error(`Opportunity ID: ${id} not found to delete`);
			throw new NotFoundException('Opportunity not found to delete');
		}

		await this.cacheService.delete(`${CacheKeyEnum.OPPORTUNITY}:${id}`);
		await this.cacheService.delete(CacheKeyEnum.CLINIC_ACTIVATED);

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

		const cacheKey = `${CacheKeyEnum.OPPORTUNITY}:${id}`;

		await this.cacheService.delete(cacheKey);

		return toOpportunityResponseDto(findOpportunityAndUpdate);
	}
}

import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ApplicationRepository } from './repository/application.repository';
import { OpportunityService } from '../opportunity/opportunity.service';
import { UserService } from '../users/user.service';
import { ApplicationCreateDto } from './dto/applicationCreateDto';

@Injectable()
export class ApplicationService {
	protected readonly _logger = new Logger('ApplicationService');
	constructor(
		private readonly applicationRepository: ApplicationRepository,
		private readonly userService: UserService,
		private readonly opportunityService: OpportunityService,
	) {}

	public async createApplication(applicationPayload: ApplicationCreateDto) {
		const { opportunityId, userId } = applicationPayload;

		const opportunityExists =
			await this.opportunityService.findOpportunityById(opportunityId);

		if (!opportunityExists) {
			this._logger.error(`Opportunity with ${opportunityId} id not exists`);
			throw new NotFoundException('Opportunity not exists');
		}

		const userExists = await this.userService.findUserById(userId);

		if (!userExists) {
			this._logger.error(`User with ${userId} id not exists`);
			throw new NotFoundException('User not exists');
		}

		const existingApplication =
			await this.applicationRepository.listApplicationByOpportunity(
				opportunityId,
			);

		if (existingApplication) {
			if (existingApplication.userIds.includes(userId)) {
				this._logger.error('User has already applied for this opportunity');
				throw new ConflictException(
					'User has already applied for this opportunity',
				);
			}

			const addUserToApplication =
				await this.applicationRepository.addUserToApplication(
					opportunityId,
					userId,
				);

			return addUserToApplication;
		}

		const createApplication =
			await this.applicationRepository.createApplication(opportunityId, userId);

		return createApplication;
	}
}

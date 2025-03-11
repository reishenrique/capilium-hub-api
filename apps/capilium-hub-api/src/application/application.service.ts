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
		const { opportunityId, appliedUserId } = applicationPayload;

		// Verify if opportunity exists
		const opportunityExists =
			await this.opportunityService.findOpportunityById(opportunityId);

		if (!opportunityExists) {
			this._logger.error(`Opportunity with ${opportunityId} id not exists`);
			throw new NotFoundException('Opportunity not exists');
		}

		// Verify if user exists to apply
		const userExists = await this.userService.findUserById(appliedUserId);

		if (!userExists) {
			this._logger.error(`User with ${appliedUserId} id not exists`);
			throw new NotFoundException('User not exists');
		}

		// Verify if user already applied
		const userAlreadyApplied =
			await this.applicationRepository.hasAppliedToOpportunity(
				opportunityId,
				appliedUserId,
			);

		if (userAlreadyApplied) {
			this._logger.error('User has already applied for this opportunity');
			throw new ConflictException(
				'User has already applied to this opportunity',
			);
		}

		// Create application
		const createApplication =
			await this.applicationRepository.createApplication(
				opportunityId,
				appliedUserId,
			);

		return createApplication;
	}
}

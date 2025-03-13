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
		const opportunityExists = await this.opportunityService.findOpportunityById(
			applicationPayload.opportunityId,
		);

		if (!opportunityExists) {
			this._logger.error(
				`Opportunity with ${applicationPayload.opportunityId} id not exists`,
			);
			throw new NotFoundException('Opportunity not exists');
		}

		const userExists = await this.userService.findUserById(
			applicationPayload.userId,
		);

		if (!userExists) {
			this._logger.error(
				`User with ${applicationPayload.userId} id not exists`,
			);
			throw new NotFoundException('User not exists');
		}

		const userAlreadyApplied =
			await this.applicationRepository.hasAppliedToOpportunity(
				applicationPayload.opportunityId,
				applicationPayload.userId,
			);

		if (userAlreadyApplied) {
			this._logger.error('User has already applied for this opportunity');
			throw new ConflictException(
				'User has already applied to this opportunity',
			);
		}

		const createApplication =
			await this.applicationRepository.createApplication(
				applicationPayload.opportunityId,
				applicationPayload.userId,
			);

		return createApplication;
	}
}

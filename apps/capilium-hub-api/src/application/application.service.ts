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
import { InjectQueue } from '@nestjs/bull';
import { EMAIL_QUEUE } from '@app/shared';
import { Queue } from 'bull';

@Injectable()
export class ApplicationService {
	protected readonly _logger = new Logger('ApplicationService');
	constructor(
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
		private readonly applicationRepository: ApplicationRepository,
		private readonly userService: UserService,
		private readonly opportunityService: OpportunityService,
	) {}

	public async createApplication(applicationPayload: ApplicationCreateDto) {
		const { opportunityId, userId } = applicationPayload;

		await this.validateOpportunityExists(opportunityId);

		await this.validateUserExists(userId);

		const existingApplication = await this.checkExistingApplication(
			opportunityId,
			userId,
		);

		if (existingApplication) {
			return this.applicationRepository.addUserToApplication(
				opportunityId,
				userId,
			);
		}

		return this.applicationRepository.createApplication(opportunityId, userId);
	}

	private async validateOpportunityExists(opportunityId: string) {
		const opportunity =
			await this.opportunityService.findOpportunityById(opportunityId);

		if (!opportunity) {
			this._logger.error(
				`Opportunity with id: ${opportunityId}, does not exist`,
			);
			throw new NotFoundException('Opportunity does not exist');
		}
	}

	private async validateUserExists(userId: string) {
		const user = await this.userService.findUserById(userId);

		if (!user) {
			this._logger.error(`User with id: ${userId}, does not exist`);
			throw new NotFoundException('User not exists');
		}
	}

	private async checkExistingApplication(
		opportunityId: string,
		userId: string,
	) {
		const existingApplication =
			await this.applicationRepository.listApplicationByOpportunity(
				opportunityId,
			);

		if (existingApplication?.userIds?.includes(userId)) {
			this._logger.error('User has already applied for this opportunity');
			throw new ConflictException('User already applied for this opportunity');
		}

		return existingApplication;
	}

	private async sendApplyConfirmationEmail(
		userEmail: string,
		firstName: string,
		opportunityTitle: string,
	): Promise<void> {
		const emailData = {
			to: userEmail,
			subject: `Application Confirmation - [${opportunityTitle}]`,
			body: `Hello ${firstName}`,
		};

		await this.emailQueue.add('send-email', {
			to: emailData.to,
			subject: emailData.subject,
			body: emailData.body,
		});
	}
}

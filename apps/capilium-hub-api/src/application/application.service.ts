import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ApplicationRepository } from './repository/application.repository';
import { ApplicationCreateDto } from './dto/applicationCreateDto';
import { InjectQueue } from '@nestjs/bull';
import { EMAIL_QUEUE } from '@app/shared';
import { Queue } from 'bull';
import { ApplicationResponseDto } from './dto/applicationResponseDto';
import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';
import templates from '../common/templates/email.templates.json';
import { UserRepository } from '../users/repository/user.repository';
import { OpportunityRepository } from '../opportunity/repositories/opportunity.repository';

@Injectable()
export class ApplicationService {
	protected readonly _logger = new Logger('ApplicationService');
	constructor(
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
		private readonly applicationRepository: ApplicationRepository,
		private readonly userRepository: UserRepository,
		private readonly opportunityRepository: OpportunityRepository,
	) {}

	public async createApplication(
		applicationPayload: ApplicationCreateDto,
	): Promise<ApplicationResponseDto> {
		const { opportunityId, userId } = applicationPayload;

		const opportunity = await this.validateOpportunityExists(opportunityId);

		const user = await this.validateUserExists(userId);

		const existingApplication =
			await this.checkExistingApplicationAndUserApplied(opportunityId, userId);

		if (existingApplication) {
			await this.applicationRepository.addUserToApplication(
				opportunityId,
				userId,
			);

			await this.sendApplyConfirmationEmail(
				user.email,
				user.firstName,
				opportunity.title,
			);

			return;
		}

		const application = await this.applicationRepository.createApplication(
			opportunityId,
			userId,
		);

		await this.sendApplyConfirmationEmail(
			user.email,
			user.firstName,
			opportunity.title,
		);

		return application;
	}

	public async validateOpportunityExists(opportunityId: string) {
		const opportunity =
			await this.opportunityRepository.findOpportunityById(opportunityId);

		if (!opportunity) {
			this._logger.error(
				`Opportunity with id: ${opportunityId}, does not exist`,
			);
			throw new NotFoundException('Opportunity does not exist');
		}

		return opportunity;
	}

	public async validateUserExists(userId: string) {
		const user = await this.userRepository.findUserById(userId);

		if (!user) {
			this._logger.error(`User with id: ${userId}, does not exist`);
			throw new NotFoundException('User not exists');
		}

		return user;
	}

	public async checkExistingApplicationAndUserApplied(
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
		const templatesEmail = templates.application;

		const emailData = {
			to: userEmail,
			subject: templatesEmail.subject.replace(
				'{{opportunityTitle}}',
				opportunityTitle,
			),
			body: templatesEmail.body.replace('{{firstName}}', firstName),
		};

		await this.emailQueue.add('send-email', {
			to: emailData.to,
			subject: emailData.subject,
			body: emailData.body,
			metadata: {
				emailType: EmailTypeEnum.APPLICATION,
			},
		});
	}

	public async deleteApplicationById(id: string): Promise<void> {
		const listApplicationById =
			this.applicationRepository.listApplicationById(id);

		if (!listApplicationById) {
			this._logger.error(`Application with ID: ${id} not found to delete`);
			throw new NotFoundException('Application not found by id');
		}

		await this.applicationRepository.deleteApplication(id);
	}
}

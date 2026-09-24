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
import { Application } from './entity/application.entity';
import { generateIdempotencyKey } from '../common/helpers/idempotencyKey.helper';
import { toUserResponseDto } from '../users/mappers/users.mappers';
import { UserResponseDto } from '../users/dto/userResponseDto';

@Injectable()
export class ApplicationService {
	protected readonly _logger = new Logger('ApplicationService');
	constructor(
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
		private readonly applicationRepository: ApplicationRepository,
		private readonly userRepository: UserRepository,
		private readonly opportunityRepository: OpportunityRepository,
	) {}

	public async apply(
		applicationPayload: ApplicationCreateDto,
	): Promise<ApplicationResponseDto> {
		const { opportunityId, userId } = applicationPayload;

		const opportunity =
			await this.opportunityRepository.findOpportunityById(opportunityId);

		const user = await this.validateUserExists(userId);

		const application =
			await this.applicationRepository.listApplicationByOpportunity(
				opportunityId,
			);

		this.validateUserHasNotApplied(application, userId);

		let applicationResponse: ApplicationResponseDto;

		if (application) {
			await this.applicationRepository.addUserToApplication(
				opportunityId,
				userId,
			);

			applicationResponse = application;
		} else {
			applicationResponse = await this.applicationRepository.createApplication(
				opportunityId,
				userId,
			);
		}

		await this.sendApplyConfirmationEmail(
			user.email,
			user.firstName,
			opportunity.title,
			opportunityId,
		);

		return applicationResponse;
	}

	private validateUserHasNotApplied(
		application: Application,
		userId: string,
	): void {
		if (application?.userIds?.includes(userId)) {
			throw new ConflictException('User already applied for this opportunity');
		}
	}

	public async validateUserExists(userId: string): Promise<UserResponseDto> {
		const user = await this.userRepository.findUserById(userId);

		if (!user) {
			this._logger.error(`User with id: ${userId}, does not exist`);
			throw new NotFoundException('User not exists');
		}

		return toUserResponseDto(user);
	}

	private async sendApplyConfirmationEmail(
		userEmail: string,
		firstName: string,
		opportunityTitle: string,
		opportunityId: string,
	): Promise<void> {
		const templatesEmail = templates.application;

		const user = await this.userRepository.findUserByEmail(userEmail);

		if (!user) return;

		const emailData = {
			to: userEmail,
			subject: templatesEmail.subject.replace(
				'{{opportunityTitle}}',
				opportunityTitle,
			),
			body: templatesEmail.body.replace('{{firstName}}', firstName),
		};

		const idempotencyKey = generateIdempotencyKey(
			user._id,
			EmailTypeEnum.APPLICATION,
			opportunityId,
		);

		await this.emailQueue.add('send-email', {
			to: emailData.to,
			subject: emailData.subject,
			body: emailData.body,
			metadata: {
				emailType: EmailTypeEnum.APPLICATION,
				idempotencyKey,
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

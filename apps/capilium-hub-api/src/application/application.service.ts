import {
	ConflictException,
	ForbiddenException,
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
import { Opportunity } from '../opportunity/entity/opportunity.entity';
import { Application } from './entity/application.entity';
import { generateIdempotencyKey } from '../common/helpers/idempotencyKey.helper';
import { isDuplicateKeyError } from '../common/helpers/mongoError.helper';
import { toUserResponseDto } from '../users/mappers/users.mappers';
import { UserResponseDto } from '../users/dto/userResponseDto';
import { toApplicationResponseDto } from './mappers/application.mappers';
import { Actor } from '../auth/interfaces/actor.interface';

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
			const updatedApplication =
				await this.applicationRepository.addUserToApplication(
					opportunityId,
					userId,
				);

			applicationResponse = toApplicationResponseDto(updatedApplication);
		} else {
			try {
				const newApplication =
					await this.applicationRepository.createApplication(
						opportunityId,
						userId,
					);

				applicationResponse = toApplicationResponseDto(newApplication);
			} catch (error) {
				if (!isDuplicateKeyError(error)) {
					throw error;
				}

				const updatedApplication =
					await this.applicationRepository.addUserToApplication(
						opportunityId,
						userId,
					);

				applicationResponse = toApplicationResponseDto(updatedApplication);
			}
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
			user._id.toString(),
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

	public async withdrawApplication(
		applicationId: string,
		actor: Actor,
	): Promise<void> {
		const application =
			await this.applicationRepository.listApplicationById(applicationId);

		if (!application) {
			this._logger.error(
				`Application with ID: ${applicationId} not found to withdraw`,
			);

			throw new NotFoundException('Application not found by id');
		}

		const isApplicant = application.userIds?.some(
			(userId) => userId.toString() === actor.id,
		);

		if (!isApplicant) return;

		const updated = await this.applicationRepository.removeUserFromApplication(
			applicationId,
			actor.id,
		);

		if (!updated) return;

		if (updated.userIds.length === 0) {
			await this.applicationRepository.deleteApplication(applicationId);
		}
	}

	public async deleteApplicationById(id: string, actor: Actor): Promise<void> {
		const application =
			await this.applicationRepository.listApplicationById(id);

		if (!application) {
			this._logger.error(`Application with ID: ${id} not found to delete`);
			throw new NotFoundException('Application not found by id');
		}

		const opportunity = await this.opportunityRepository.findOpportunityById(
			application.opportunityId,
		);

		if (!opportunity) {
			this._logger.error(
				`Opportunity with ID: ${application.opportunityId} not found for application ${id}`,
			);
			throw new NotFoundException('Opportunity not found for this application');
		}

		this.validateCanDeleteApplication(opportunity, actor);

		await this.applicationRepository.deleteApplication(id);
	}

	private validateCanDeleteApplication(
		opportunity: Opportunity,
		actor: Actor,
	): void {
		const isClinicOwner = Boolean(
			actor.isAdmin &&
				actor.clinicId &&
				opportunity.clinicId?.toString() === actor.clinicId.toString(),
		);

		if (!isClinicOwner) {
			throw new ForbiddenException(
				'Only the clinic administrator responsible for the opportunity can delete this application',
			);
		}
	}
}

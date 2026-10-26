import { EMAIL_QUEUE } from '@app/shared';
import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';
import { getQueueToken } from '@nestjs/bull';
import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { Actor } from '../../auth/interfaces/actor.interface';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { OpportunityDocument } from '../../opportunity/schemas/opportunity.schema';
import { UserRepository } from '../../users/repository/user.repository';
import { UserDocument } from '../../users/schemas/users.schema';
import { ApplicationService } from '../application.service';
import { ApplicationRepository } from '../repository/application.repository';
import { ApplicationDocument } from '../schemas/applications.schema';

describe('ApplicationService', () => {
	let applicationService: ApplicationService;
	let applicationRepository: jest.Mocked<ApplicationRepository>;
	let userRepository: jest.Mocked<UserRepository>;
	let opportunityRepository: jest.Mocked<OpportunityRepository>;
	let emailQueue: jest.Mocked<Queue>;

	const applicationId = '67dc76395488f214f38a74db';
	const opportunityId = '67ba145c48ea4e5cdf5b5a0e';
	const userId = '67e45f92c7e1b53f5978c3e5';
	const otherUserId = '67e45f92c7e1b53f5978c3e6';
	const clinicId = '67ba145c48ea4e5cdf5b5a0f';
	const otherClinicId = '67ba145c48ea4e5cdf5b5a10';

	const applicationPayload = { opportunityId, userId };

	const buildUserDocument = (): UserDocument => {
		const user = {
			_id: userId,
			email: 'candidate@example.com',
			firstName: 'Candidate',
		};

		return {
			...user,
			_id: { toString: () => userId },
			toObject: () => ({ ...user }),
		} as unknown as UserDocument;
	};

	const buildOpportunityDocument = (
		ownerClinicId = clinicId,
	): OpportunityDocument => {
		const opportunity = {
			_id: opportunityId,
			title: 'Test opportunity',
			clinicId: ownerClinicId,
		};

		return {
			...opportunity,
			_id: { toString: () => opportunityId },
			toObject: () => ({ ...opportunity }),
		} as unknown as OpportunityDocument;
	};

	const buildApplicationDocument = (
		userIds: string[],
		overrides: Partial<{ opportunityId: string }> = {},
	): ApplicationDocument => {
		const application = {
			_id: applicationId,
			opportunityId,
			userIds,
			...overrides,
		};

		return {
			...application,
			_id: { toString: () => applicationId },
			toObject: () => ({ ...application }),
		} as unknown as ApplicationDocument;
	};

	const toApplicationResponse = (application: ApplicationDocument) => ({
		...application.toObject(),
		_id: application._id.toString(),
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApplicationService,
				{
					provide: ApplicationRepository,
					useValue: {
						listApplicationByOpportunity: jest.fn(),
						listApplicationById: jest.fn(),
						createApplication: jest.fn(),
						addUserToApplication: jest.fn(),
						removeUserFromApplication: jest.fn(),
						deleteApplication: jest.fn(),
						deleteApplicationIfEmpty: jest.fn(),
					},
				},
				{
					provide: UserRepository,
					useValue: {
						findUserById: jest.fn(),
						findUserByEmail: jest.fn(),
					},
				},
				{
					provide: OpportunityRepository,
					useValue: {
						findOpportunityById: jest.fn(),
					},
				},
				{
					provide: getQueueToken(EMAIL_QUEUE),
					useValue: {
						add: jest.fn(),
					},
				},
			],
		}).compile();

		applicationService = module.get<ApplicationService>(ApplicationService);
		applicationRepository = module.get(ApplicationRepository);
		userRepository = module.get(UserRepository);
		opportunityRepository = module.get(OpportunityRepository);
		emailQueue = module.get(getQueueToken(EMAIL_QUEUE));

		opportunityRepository.findOpportunityById.mockResolvedValue(
			buildOpportunityDocument(),
		);
		userRepository.findUserById.mockResolvedValue(buildUserDocument());
		userRepository.findUserByEmail.mockResolvedValue(buildUserDocument());
		emailQueue.add.mockResolvedValue({} as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('apply', () => {
		it('should create a new application when none exists for the opportunity', async () => {
			const createdApplication = buildApplicationDocument([userId]);

			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				null,
			);
			applicationRepository.createApplication.mockResolvedValue(
				createdApplication,
			);

			const result = await applicationService.apply(applicationPayload);

			expect(result).toEqual(toApplicationResponse(createdApplication));
			expect(applicationRepository.createApplication).toHaveBeenCalledWith(
				opportunityId,
				userId,
			);
			expect(applicationRepository.addUserToApplication).not.toHaveBeenCalled();
		});

		it('should add the user and return the updated application when it already exists', async () => {
			const updatedApplication = buildApplicationDocument([
				otherUserId,
				userId,
			]);

			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);
			applicationRepository.addUserToApplication.mockResolvedValue(
				updatedApplication,
			);

			const result = await applicationService.apply(applicationPayload);

			expect(result).toEqual(toApplicationResponse(updatedApplication));
			expect(applicationRepository.addUserToApplication).toHaveBeenCalledWith(
				opportunityId,
				userId,
			);
			expect(applicationRepository.createApplication).not.toHaveBeenCalled();
		});

		it('should send a confirmation email after applying', async () => {
			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				null,
			);
			applicationRepository.createApplication.mockResolvedValue(
				buildApplicationDocument([userId]),
			);

			await applicationService.apply(applicationPayload);

			expect(emailQueue.add).toHaveBeenCalledWith(
				'send-email',
				expect.objectContaining({
					to: 'candidate@example.com',
					metadata: expect.objectContaining({
						emailType: EmailTypeEnum.APPLICATION,
					}),
				}),
			);
		});

		it('should skip the confirmation email when the user email is not found', async () => {
			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				null,
			);
			applicationRepository.createApplication.mockResolvedValue(
				buildApplicationDocument([userId]),
			);
			userRepository.findUserByEmail.mockResolvedValue(null);

			await expect(
				applicationService.apply(applicationPayload),
			).resolves.toEqual(
				toApplicationResponse(buildApplicationDocument([userId])),
			);

			expect(userRepository.findUserByEmail).toHaveBeenCalledWith(
				'candidate@example.com',
			);
			expect(emailQueue.add).not.toHaveBeenCalled();
		});

		it('should throw ConflictException when the duplicate fallback removes the application', async () => {
			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				null,
			);
			applicationRepository.createApplication.mockRejectedValue({
				code: 11000,
			});
			applicationRepository.addUserToApplication.mockResolvedValue(null);

			await expect(
				applicationService.apply(applicationPayload),
			).rejects.toThrow(ConflictException);

			expect(emailQueue.add).not.toHaveBeenCalled();
		});

		it('should fall back to addUserToApplication when create hits a duplicate key', async () => {
			const updatedApplication = buildApplicationDocument([userId]);

			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				null,
			);
			applicationRepository.createApplication.mockRejectedValue({
				code: 11000,
			});
			applicationRepository.addUserToApplication.mockResolvedValue(
				updatedApplication,
			);

			const result = await applicationService.apply(applicationPayload);

			expect(applicationRepository.addUserToApplication).toHaveBeenCalledWith(
				opportunityId,
				userId,
			);
			expect(result).toEqual(toApplicationResponse(updatedApplication));
			expect(emailQueue.add).toHaveBeenCalled();
		});

		it('should detect an existing applicant stored as ObjectId', async () => {
			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				buildApplicationDocument([{ toString: () => userId } as any]),
			);

			await expect(
				applicationService.apply(applicationPayload),
			).rejects.toThrow(ConflictException);

			expect(applicationRepository.addUserToApplication).not.toHaveBeenCalled();
			expect(applicationRepository.createApplication).not.toHaveBeenCalled();
			expect(emailQueue.add).not.toHaveBeenCalled();
		});

		it('should throw ConflictException when the application is removed during apply', async () => {
			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);
			applicationRepository.addUserToApplication.mockResolvedValue(null);

			await expect(
				applicationService.apply(applicationPayload),
			).rejects.toThrow(ConflictException);

			expect(emailQueue.add).not.toHaveBeenCalled();
		});

		it('should validate the opportunity before loading the user', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(null);

			await expect(
				applicationService.apply(applicationPayload),
			).rejects.toThrow(new NotFoundException('Opportunity not found'));

			expect(userRepository.findUserById).not.toHaveBeenCalled();
			expect(
				applicationRepository.listApplicationByOpportunity,
			).not.toHaveBeenCalled();
		});

		it('should throw NotFoundException when the user does not exist', async () => {
			userRepository.findUserById.mockResolvedValue(null);

			await expect(
				applicationService.apply(applicationPayload),
			).rejects.toThrow(NotFoundException);

			expect(applicationRepository.createApplication).not.toHaveBeenCalled();
			expect(emailQueue.add).not.toHaveBeenCalled();
		});

		it('should rethrow non-duplicate errors without adding the user or queueing email', async () => {
			applicationRepository.listApplicationByOpportunity.mockResolvedValue(
				null,
			);
			applicationRepository.createApplication.mockRejectedValue(
				new Error('database unavailable'),
			);

			await expect(
				applicationService.apply(applicationPayload),
			).rejects.toThrow('database unavailable');

			expect(applicationRepository.addUserToApplication).not.toHaveBeenCalled();
			expect(emailQueue.add).not.toHaveBeenCalled();
		});
	});

	describe('withdrawApplication', () => {
		const actor: Actor = { id: userId, isAdmin: false };

		it('should remove only the actor id when there are multiple applicants', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([userId, otherUserId]),
			);
			applicationRepository.removeUserFromApplication.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).resolves.toBeUndefined();

			expect(
				applicationRepository.removeUserFromApplication,
			).toHaveBeenCalledWith(applicationId, userId);
			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
			expect(
				applicationRepository.deleteApplicationIfEmpty,
			).not.toHaveBeenCalled();
		});

		it('should delete the application when the actor is the last applicant', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([userId]),
			);
			applicationRepository.removeUserFromApplication.mockResolvedValue(
				buildApplicationDocument([]),
			);

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).resolves.toBeUndefined();

			expect(
				applicationRepository.deleteApplicationIfEmpty,
			).toHaveBeenCalledWith(applicationId);
			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('should stop when the application changes between read and update', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([userId]),
			);
			applicationRepository.removeUserFromApplication.mockResolvedValue(null);

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).resolves.toBeUndefined();

			expect(
				applicationRepository.deleteApplicationIfEmpty,
			).not.toHaveBeenCalled();
		});

		it('should do nothing when the actor is not an applicant', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).resolves.toBeUndefined();

			expect(
				applicationRepository.removeUserFromApplication,
			).not.toHaveBeenCalled();
			expect(
				applicationRepository.deleteApplicationIfEmpty,
			).not.toHaveBeenCalled();
		});

		it('should throw NotFoundException when the application does not exist', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(null);

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).rejects.toThrow(NotFoundException);

			expect(
				applicationRepository.removeUserFromApplication,
			).not.toHaveBeenCalled();
		});
	});

	describe('deleteApplicationById', () => {
		const actor: Actor = { id: 'admin-id', isAdmin: true, clinicId };

		it('should allow the administrator of the clinic that owns the opportunity', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunityDocument(clinicId),
			);
			applicationRepository.deleteApplication.mockResolvedValue(undefined);

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).resolves.toBeUndefined();

			expect(applicationRepository.deleteApplication).toHaveBeenCalledWith(
				applicationId,
			);
		});

		it('should forbid an administrator of another clinic', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunityDocument(otherClinicId),
			);

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).rejects.toThrow(ForbiddenException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('should forbid a non-admin applicant', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([userId]),
			);
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunityDocument(clinicId),
			);

			await expect(
				applicationService.deleteApplicationById(applicationId, {
					id: userId,
					isAdmin: false,
					clinicId,
				}),
			).rejects.toThrow(ForbiddenException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('should forbid an administrator without a clinic', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunityDocument(clinicId),
			);

			await expect(
				applicationService.deleteApplicationById(applicationId, {
					id: 'admin-id',
					isAdmin: true,
				}),
			).rejects.toThrow(ForbiddenException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('should throw NotFoundException when the opportunity does not exist', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplicationDocument([otherUserId]),
			);
			opportunityRepository.findOpportunityById.mockResolvedValue(null);

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).rejects.toThrow(NotFoundException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('should throw NotFoundException when the application does not exist', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(null);

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).rejects.toThrow(NotFoundException);

			expect(opportunityRepository.findOpportunityById).not.toHaveBeenCalled();
			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});
	});

	describe('validateUserExists', () => {
		it('should return the user when found', async () => {
			const user = buildUserDocument();
			userRepository.findUserById.mockResolvedValue(user);

			const result = await applicationService.validateUserExists(userId);

			expect(result).toEqual({
				...user.toObject(),
				_id: userId,
			});
		});

		it('should throw NotFoundException when the user is not found', async () => {
			userRepository.findUserById.mockResolvedValue(null);

			await expect(
				applicationService.validateUserExists('id-inexistente'),
			).rejects.toThrow(NotFoundException);
		});
	});
});

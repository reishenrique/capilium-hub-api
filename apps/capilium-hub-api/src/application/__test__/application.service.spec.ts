import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from '../application.service';
import { ApplicationRepository } from '../repository/application.repository';
import { getQueueToken } from '@nestjs/bull';
import { EMAIL_QUEUE } from '@app/shared';
import { StatusEnum } from '../../common/enums/status.enum';
import {
	ConflictException,
	NotFoundException,
} from '@nestjs/common/exceptions';
import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';
import { Queue } from 'bull';
import { createUserEntityMock } from '../../common/factories/user.factory';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { UserRepository } from '../../users/repository/user.repository';
import { User } from '../../users/entity/users.entity';

describe('ApplicationService', () => {
	let applicationService: ApplicationService;
	let applicationRepository: jest.Mocked<ApplicationRepository>;
	let userRepository: jest.Mocked<UserRepository>;
	let opportunityRepository: jest.Mocked<OpportunityRepository>;
	let emailQueue: jest.Mocked<Queue>;

	const mockOpportunity = {
		_id: '67ba145c48ea4e5cdf5b5a0e',
		title: 'Teste',
		description: 'Teste',
		location: 'Teste',
		salary: 100,
		status: StatusEnum.Open,
		clinicName: 'ClinicName',
		createdAt: new Date('2025-02-22T18:15:56.550Z'),
		updatedAt: new Date('2025-02-22T18:15:56.550Z'),
	};

	const mockUser = createUserEntityMock() as User & { _id: string };

	const mockApplication = {
		_id: '67dc76395488f214f38a74db',
		opportunityId: '67ba145c48ea4e5cdf5b5a0e',
		userIds: [],
		createdAt: '2025-03-20T20:10:39.526Z',
		updatedAt: '2025-03-26T20:14:00.532Z',
		__v: 0,
	};

	const applicationPayload = {
		opportunityId: '67ba145c48ea4e5cdf5b5a0e',
		userId: '67e45f92c7e1b53f5978c3e5',
	};

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
						deleteApplication: jest.fn(),
					},
				},
				{
					provide: UserRepository,
					useValue: {
						findUserById: jest.fn(),
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
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('apply', () => {
		describe('Success Cases', () => {
			beforeEach(() => {
				opportunityRepository.findOpportunityById.mockResolvedValue(
					mockOpportunity,
				);
				userRepository.findUserById.mockResolvedValue(mockUser);
				emailQueue.add.mockResolvedValue({} as any);
			});

			it('should create a new application when no application exists for the opportunity', async () => {
				applicationRepository.listApplicationByOpportunity.mockResolvedValue(
					null,
				);
				applicationRepository.createApplication.mockResolvedValue(
					mockApplication,
				);

				const result = await applicationService.apply(applicationPayload);

				expect(result.opportunityId).toBe(applicationPayload.opportunityId);
				expect(applicationRepository.createApplication).toHaveBeenCalledWith(
					applicationPayload.opportunityId,
					applicationPayload.userId,
				);
				expect(
					applicationRepository.addUserToApplication,
				).not.toHaveBeenCalled();
			});

			it('should add user to an existing application', async () => {
				applicationRepository.listApplicationByOpportunity.mockResolvedValue({
					...mockApplication,
					userIds: ['outro-user-id'],
				});
				applicationRepository.addUserToApplication.mockResolvedValue({} as any);

				await applicationService.apply(applicationPayload);

				expect(applicationRepository.addUserToApplication).toHaveBeenCalledWith(
					applicationPayload.opportunityId,
					applicationPayload.userId,
				);
				expect(applicationRepository.createApplication).not.toHaveBeenCalled();
			});

			it('should send confirmation email after application', async () => {
				applicationRepository.listApplicationByOpportunity.mockResolvedValue(
					null,
				);
				applicationRepository.createApplication.mockResolvedValue(
					mockApplication,
				);

				await applicationService.apply(applicationPayload);

				expect(emailQueue.add).toHaveBeenCalledWith(
					'send-email',
					expect.objectContaining({
						to: mockUser.email,
						metadata: { emailType: EmailTypeEnum.APPLICATION },
					}),
				);
			});
		});

		describe('Failure Cases', () => {
			it('should throw NotFoundException when opportunity does not exist', async () => {
				opportunityRepository.findOpportunityById.mockResolvedValue(null);
				userRepository.findUserById.mockResolvedValue(mockUser);

				await expect(
					applicationService.apply(applicationPayload),
				).rejects.toThrow(NotFoundException);
			});

			it('should throw NotFoundException when user does not exist', async () => {
				opportunityRepository.findOpportunityById.mockResolvedValue(
					mockOpportunity,
				);
				userRepository.findUserById.mockResolvedValue(null);

				await expect(
					applicationService.apply(applicationPayload),
				).rejects.toThrow(NotFoundException);
			});

			it('should throw ConflictException when user has already applied for the opportunity', async () => {
				opportunityRepository.findOpportunityById.mockResolvedValue(
					mockOpportunity,
				);
				userRepository.findUserById.mockResolvedValue(mockUser);
				applicationRepository.listApplicationByOpportunity.mockResolvedValue({
					...mockApplication,
					userIds: [applicationPayload.userId],
				});

				await expect(
					applicationService.apply(applicationPayload),
				).rejects.toThrow(ConflictException);
			});
		});
	});

	describe('validateOpportunityExists', () => {
		it('should return the opportunity when found', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(
				mockOpportunity,
			);

			const result = await applicationService.validateOpportunityExists(
				mockOpportunity._id,
			);

			expect(result).toEqual(mockOpportunity);
		});

		it('should throw NotFoundException when opportunity is not found', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(null);

			await expect(
				applicationService.validateOpportunityExists('id-inexistente'),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('validateUserExists', () => {
		it('should return the user when found', async () => {
			userRepository.findUserById.mockResolvedValue(mockUser);

			const result = await applicationService.validateUserExists(mockUser._id);

			expect(result).toEqual(mockUser);
		});

		it('should throw NotFoundException when user is not found', async () => {
			userRepository.findUserById.mockResolvedValue(null);

			await expect(
				applicationService.validateUserExists('id-inexistente'),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('deleteApplicationById', () => {
		it('should delete application successfully', async () => {
			applicationRepository.listApplicationById.mockReturnValue(
				mockApplication as any,
			);
			applicationRepository.deleteApplication.mockResolvedValue(undefined);

			await expect(
				applicationService.deleteApplicationById(mockApplication._id),
			).resolves.not.toThrow();

			expect(applicationRepository.deleteApplication).toHaveBeenCalledWith(
				mockApplication._id,
			);
		});

		it('should throw NotFoundException when application is not found', async () => {
			applicationRepository.listApplicationById.mockReturnValue(null);

			await expect(
				applicationService.deleteApplicationById('id-inexistente'),
			).rejects.toThrow(NotFoundException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});
	});
});

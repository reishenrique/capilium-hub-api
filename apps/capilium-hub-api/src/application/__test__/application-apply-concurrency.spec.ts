import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { EMAIL_QUEUE } from '@app/shared';
import { ApplicationService } from '../application.service';
import { ApplicationRepository } from '../repository/application.repository';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { UserRepository } from '../../users/repository/user.repository';

describe('ApplicationService apply concurrency', () => {
	let applicationService: ApplicationService;
	let applicationRepository: jest.Mocked<ApplicationRepository>;
	let opportunityRepository: jest.Mocked<OpportunityRepository>;
	let userRepository: jest.Mocked<UserRepository>;
	let emailQueue: { add: jest.Mock };

	const applicationId = '67dc76395488f214f38a74db';
	const opportunityId = '67ba145c48ea4e5cdf5b5a0e';
	const userId = '67e45f92c7e1b53f5978c3e5';
	const otherUserId = '67e45f92c7e1b53f5978c3e6';

	const buildApplication = (userIds: string[]) => ({
		_id: { toString: () => applicationId },
		opportunityId,
		userIds,
		toObject: () => ({ _id: applicationId, opportunityId, userIds }),
	});

	const buildUser = () => ({
		_id: { toString: () => userId },
		email: 'candidate@example.com',
		firstName: 'Candidate',
		toObject: () => ({
			_id: userId,
			email: 'candidate@example.com',
			firstName: 'Candidate',
		}),
	});

	const opportunity = {
		_id: opportunityId,
		title: 'Test opportunity',
	};

	beforeEach(async () => {
		emailQueue = { add: jest.fn().mockResolvedValue({}) };

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApplicationService,
				{
					provide: ApplicationRepository,
					useValue: {
						listApplicationByOpportunity: jest.fn(),
						addUserToApplication: jest.fn(),
						createApplication: jest.fn(),
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
					useValue: emailQueue,
				},
			],
		}).compile();

		applicationService = module.get<ApplicationService>(ApplicationService);
		applicationRepository = module.get<ApplicationRepository>(
			ApplicationRepository,
		) as jest.Mocked<ApplicationRepository>;
		opportunityRepository = module.get<OpportunityRepository>(
			OpportunityRepository,
		) as jest.Mocked<OpportunityRepository>;
		userRepository = module.get<UserRepository>(
			UserRepository,
		) as jest.Mocked<UserRepository>;

		opportunityRepository.findOpportunityById.mockResolvedValue(
			opportunity as any,
		);
		userRepository.findUserById.mockResolvedValue(buildUser() as any);
		userRepository.findUserByEmail.mockResolvedValue(buildUser() as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('falls back to addUserToApplication when create hits a duplicate key', async () => {
		applicationRepository.listApplicationByOpportunity.mockResolvedValue(null);
		applicationRepository.createApplication.mockRejectedValue({ code: 11000 });
		applicationRepository.addUserToApplication.mockResolvedValue(
			buildApplication([userId]) as any,
		);

		const result = await applicationService.apply({ opportunityId, userId });

		expect(
			applicationRepository.addUserToApplication,
		).toHaveBeenCalledWith(opportunityId, userId);
		expect(result.userIds).toContain(userId);
		expect(emailQueue.add).toHaveBeenCalled();
	});

	it('rethrows non-duplicate errors without adding the user or queueing email', async () => {
		applicationRepository.listApplicationByOpportunity.mockResolvedValue(null);
		applicationRepository.createApplication.mockRejectedValue(
			new Error('database unavailable'),
		);

		await expect(
			applicationService.apply({ opportunityId, userId }),
		).rejects.toThrow('database unavailable');

		expect(applicationRepository.addUserToApplication).not.toHaveBeenCalled();
		expect(emailQueue.add).not.toHaveBeenCalled();
	});

	it('returns the updated document when the application already exists', async () => {
		applicationRepository.listApplicationByOpportunity.mockResolvedValue(
			buildApplication([otherUserId]) as any,
		);
		applicationRepository.addUserToApplication.mockResolvedValue(
			buildApplication([otherUserId, userId]) as any,
		);

		const result = await applicationService.apply({ opportunityId, userId });

		expect(applicationRepository.createApplication).not.toHaveBeenCalled();
		expect(result.userIds).toEqual([otherUserId, userId]);
	});
});

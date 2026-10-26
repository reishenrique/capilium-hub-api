import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { EMAIL_QUEUE } from '@app/shared';
import { ApplicationService } from '../application.service';
import { ApplicationRepository } from '../repository/application.repository';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { UserRepository } from '../../users/repository/user.repository';
import { Actor } from '../../auth/interfaces/actor.interface';

describe('ApplicationService ownership', () => {
	let applicationService: ApplicationService;
	let applicationRepository: jest.Mocked<ApplicationRepository>;
	let opportunityRepository: jest.Mocked<OpportunityRepository>;

	const applicationId = '67dc76395488f214f38a74db';
	const opportunityId = '67ba145c48ea4e5cdf5b5a0e';
	const actorId = '67e45f92c7e1b53f5978c3e5';
	const otherUserId = '67e45f92c7e1b53f5978c3e6';
	const clinicId = '67ba145c48ea4e5cdf5b5a0f';
	const otherClinicId = '67ba145c48ea4e5cdf5b5a10';

	const buildApplication = (userIds: string[]) =>
		({
			_id: applicationId,
			opportunityId,
			userIds,
		}) as any;

	const buildOpportunity = (ownerClinicId?: string) =>
		({
			_id: opportunityId,
			title: 'Test opportunity',
			description: 'Test description',
			location: 'Remote',
			salary: 1000,
			clinicId: ownerClinicId,
		}) as any;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApplicationService,
				{
					provide: ApplicationRepository,
					useValue: {
						listApplicationById: jest.fn(),
						removeUserFromApplication: jest.fn(),
						deleteApplication: jest.fn(),
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
		applicationRepository = module.get<ApplicationRepository>(
			ApplicationRepository,
		) as jest.Mocked<ApplicationRepository>;
		opportunityRepository = module.get<OpportunityRepository>(
			OpportunityRepository,
		) as jest.Mocked<OpportunityRepository>;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('withdrawApplication', () => {
		it('removes only the actor id when there are multiple applicants', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplication([actorId, otherUserId]),
			);
			applicationRepository.removeUserFromApplication.mockResolvedValue(
				buildApplication([otherUserId]),
			);

			const actor: Actor = { id: actorId, isAdmin: false };

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).resolves.toBeUndefined();

			expect(
				applicationRepository.removeUserFromApplication,
			).toHaveBeenCalledWith(applicationId, actorId);
			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('deletes the application when the actor is the last applicant', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplication([actorId]),
			);
			applicationRepository.removeUserFromApplication.mockResolvedValue(
				buildApplication([]),
			);

			const actor: Actor = { id: actorId, isAdmin: false };

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).resolves.toBeUndefined();

			expect(applicationRepository.deleteApplication).toHaveBeenCalledWith(
				applicationId,
			);
		});

		it('does nothing when the actor is not an applicant', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplication([otherUserId]),
			);

			const actor: Actor = { id: actorId, isAdmin: false };

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).resolves.toBeUndefined();

			expect(
				applicationRepository.removeUserFromApplication,
			).not.toHaveBeenCalled();
			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('throws NotFoundException when the application does not exist', async () => {
			applicationRepository.listApplicationById.mockResolvedValue(null);

			const actor: Actor = { id: actorId, isAdmin: false };

			await expect(
				applicationService.withdrawApplication(applicationId, actor),
			).rejects.toThrow(NotFoundException);

			expect(
				applicationRepository.removeUserFromApplication,
			).not.toHaveBeenCalled();
		});
	});

	describe('deleteApplicationById', () => {
		beforeEach(() => {
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplication([otherUserId]),
			);
			applicationRepository.deleteApplication.mockResolvedValue(undefined);
		});

		it('allows an administrator of the clinic that owns the opportunity', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunity(clinicId),
			);

			const actor: Actor = { id: actorId, isAdmin: true, clinicId };

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).resolves.toBeUndefined();

			expect(applicationRepository.deleteApplication).toHaveBeenCalledWith(
				applicationId,
			);
		});

		it('forbids an administrator of another clinic', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunity(clinicId),
			);

			const actor: Actor = {
				id: actorId,
				isAdmin: true,
				clinicId: otherClinicId,
			};

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).rejects.toThrow(ForbiddenException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('forbids a non-admin applicant', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunity(clinicId),
			);
			applicationRepository.listApplicationById.mockResolvedValue(
				buildApplication([actorId]),
			);

			const actor: Actor = { id: actorId, isAdmin: false, clinicId };

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).rejects.toThrow(ForbiddenException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});

		it('throws NotFoundException when the opportunity does not exist', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(null);

			const actor: Actor = { id: actorId, isAdmin: true, clinicId };

			await expect(
				applicationService.deleteApplicationById(applicationId, actor),
			).rejects.toThrow(NotFoundException);

			expect(applicationRepository.deleteApplication).not.toHaveBeenCalled();
		});
	});
});

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Actor } from '../../auth/interfaces/actor.interface';
import { ClinicRepository } from '../../clinic/repository/clinic.repository';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { UserRepository } from '../../users/repository/user.repository';
import { OpportunityService } from '../opportunity.service';
import { OpportunityRepository } from '../repositories/opportunity.repository';

describe('OpportunityService clinic ownership', () => {
	let opportunityService: OpportunityService;
	let opportunityRepository: jest.Mocked<OpportunityRepository>;

	const opportunityId = '67ba145c48ea4e5cdf5b5a0e';
	const clinicId = '67ba145c48ea4e5cdf5b5a0f';
	const otherClinicId = '67ba145c48ea4e5cdf5b5a10';

	const buildOpportunity = (ownerClinicId = clinicId) => {
		const opportunity = {
			_id: opportunityId,
			title: 'Test opportunity',
			description: 'Test description',
			location: 'Remote',
			salary: 1000,
			clinicId: ownerClinicId,
		};

		return {
			...opportunity,
			_id: { toString: () => opportunityId },
			toObject: () => opportunity,
		} as any;
	};

	const actor: Actor = { id: 'admin-id', isAdmin: true, clinicId };

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OpportunityService,
				{
					provide: OpportunityRepository,
					useValue: {
						findOpportunityById: jest.fn(),
						findOpportunityByIdAndUpdate: jest.fn(),
						deleteOpportunity: jest.fn(),
					},
				},
				{
					provide: UserRepository,
					useValue: {
						findUserById: jest.fn(),
					},
				},
				{
					provide: ClinicRepository,
					useValue: {
						findClinicById: jest.fn(),
					},
				},
				{
					provide: CacheService,
					useValue: {
						get: jest.fn(),
						set: jest.fn(),
						delete: jest.fn(),
					},
				},
			],
		}).compile();

		opportunityService = module.get<OpportunityService>(OpportunityService);
		opportunityRepository = module.get<OpportunityRepository>(
			OpportunityRepository,
		) as jest.Mocked<OpportunityRepository>;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('deleteOpportunityById', () => {
		it('allows the administrator of the clinic that owns the opportunity', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunity(),
			);
			opportunityRepository.deleteOpportunity.mockResolvedValue(undefined);

			await expect(
				opportunityService.deleteOpportunityById(opportunityId, actor),
			).resolves.toBeUndefined();

			expect(opportunityRepository.deleteOpportunity).toHaveBeenCalledWith(
				opportunityId,
			);
		});

		it('forbids an administrator of another clinic', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunity(otherClinicId),
			);

			await expect(
				opportunityService.deleteOpportunityById(opportunityId, actor),
			).rejects.toThrow(ForbiddenException);

			expect(opportunityRepository.deleteOpportunity).not.toHaveBeenCalled();
		});

		it('throws NotFoundException when the opportunity does not exist', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(null);

			await expect(
				opportunityService.deleteOpportunityById(opportunityId, actor),
			).rejects.toThrow(NotFoundException);

			expect(opportunityRepository.deleteOpportunity).not.toHaveBeenCalled();
		});
	});

	describe('updateOpportunityById', () => {
		it('allows the administrator of the clinic that owns the opportunity', async () => {
			const opportunity = buildOpportunity();
			opportunityRepository.findOpportunityById.mockResolvedValue(opportunity);
			opportunityRepository.findOpportunityByIdAndUpdate.mockResolvedValue(
				opportunity,
			);

			const result = await opportunityService.updateOpportunityById(
				opportunityId,
				{ title: 'Updated title' },
				actor,
			);

			expect(result).toEqual({
				...opportunity.toObject(),
				_id: opportunityId,
			});
			expect(
				opportunityRepository.findOpportunityByIdAndUpdate,
			).toHaveBeenCalledWith(opportunityId, { title: 'Updated title' });
		});

		it('forbids an administrator of another clinic', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(
				buildOpportunity(otherClinicId),
			);

			await expect(
				opportunityService.updateOpportunityById(
					opportunityId,
					{ title: 'Updated title' },
					actor,
				),
			).rejects.toThrow(ForbiddenException);

			expect(
				opportunityRepository.findOpportunityByIdAndUpdate,
			).not.toHaveBeenCalled();
		});

		it('throws NotFoundException when the opportunity does not exist', async () => {
			opportunityRepository.findOpportunityById.mockResolvedValue(null);

			await expect(
				opportunityService.updateOpportunityById(
					opportunityId,
					{ title: 'Updated title' },
					actor,
				),
			).rejects.toThrow(NotFoundException);

			expect(
				opportunityRepository.findOpportunityByIdAndUpdate,
			).not.toHaveBeenCalled();
		});
	});
});

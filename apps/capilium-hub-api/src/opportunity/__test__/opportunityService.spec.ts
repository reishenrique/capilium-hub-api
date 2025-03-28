import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityService } from '../../opportunity/opportunity.service';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { createMock } from '@golevelup/ts-jest';
import { StatusEnum } from '../../common/enums/status.enum';
import { NotFoundException } from '@nestjs/common';

describe('Opportunity Service', () => {
	let opportunityService: OpportunityService;
	let opportunityRepository: OpportunityRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OpportunityService,
				{
					provide: OpportunityRepository,
					useValue: createMock<OpportunityRepository>(),
				},
			],
		}).compile();

		opportunityService = module.get<OpportunityService>(OpportunityService);
		opportunityRepository =
			module.get<OpportunityRepository>(OpportunityService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Success Cases', () => {
		it('Should create a new opporunity', async () => {
			const opportunityPayload = {
				title: 'Teste',
				description: 'Teste',
				location: 'Teste',
				salary: 100,
				status: StatusEnum.Open,
				clinicName: 'ClinicName',
			};

			const spyCreateOpportunityRepo = jest
				.spyOn(opportunityRepository, 'create')
				.mockResolvedValue(opportunityPayload);

			const spyOpportunityService = jest.spyOn(opportunityService, 'create');

			const opportunity = await opportunityService.create(opportunityPayload);

			expect(opportunity.title).toBe(opportunityPayload.title);
			expect(opportunity.status).toBe(opportunityPayload.status);

			expect(opportunity).toEqual(
				expect.objectContaining({
					title: expect.any(String),
					description: expect.any(String),
					location: expect.any(String),
					salary: expect.any(Number),
					status: expect.any(String),
					clinicName: expect.any(String),
				}),
			);

			expect(spyCreateOpportunityRepo).toHaveBeenCalledTimes(1);
			expect(spyOpportunityService).toHaveBeenCalledTimes(1);
		});

		it('Should create opportunity and candidate array addition', async () => {
			const opportunityPayload = {
				title: 'Teste',
				description: 'Teste',
				location: 'Teste',
				salary: 100,
				status: StatusEnum.Open,
				clinicName: 'ClinicName',
			};

			const spyCreateOpportunityRepo = jest
				.spyOn(opportunityRepository, 'create')
				.mockResolvedValue(opportunityPayload);

			const spyOpportunityService = jest.spyOn(opportunityService, 'create');

			const opportunity = await opportunityService.create(opportunityPayload);

			expect(opportunity.title).toBe(opportunityPayload.title);
			expect(opportunity.status).toBe(opportunityPayload.status);

			expect(opportunity).toEqual(
				expect.objectContaining({
					title: expect.any(String),
					description: expect.any(String),
					location: expect.any(String),
					salary: expect.any(Number),
					status: expect.any(String),
					clinicName: expect.any(String),
				}),
			);

			expect(spyCreateOpportunityRepo).toHaveBeenCalledTimes(1);
			expect(spyOpportunityService).toHaveBeenCalledTimes(1);
		});

		it('Should list an opportunity by id', async () => {
			const opportunityId = '67ba145c48ea4e5cdf5b5a0e';

			const opportunityPayloadResponse = {
				_id: '67ba145c48ea4e5cdf5b5a0e',
				title: 'Teste',
				description: 'Teste',
				location: 'Teste',
				salary: 100,
				status: StatusEnum.Open,
				clinicName: 'ClinicName',
				createdAt: '2025-02-22T18:15:56.550Z',
				updatedAt: '2025-02-22T18:15:56.550Z',
				__v: 0,
			};

			const spyFindOpportunityByIdRepo = jest
				.spyOn(opportunityRepository, 'findOpportunityById')
				.mockResolvedValue(opportunityPayloadResponse);

			const spyOpportunityService = jest.spyOn(
				opportunityService,
				'findOpportunityById',
			);

			const findOpportunityById =
				await opportunityService.findOpportunityById(opportunityId);

			expect(findOpportunityById).toEqual(opportunityPayloadResponse);

			expect(spyFindOpportunityByIdRepo).toHaveBeenCalledTimes(1);
			expect(spyOpportunityService).toHaveBeenCalledTimes(1);
		});
	});
	describe('Error Cases', () => {
		it('Should return an exception when not returning a opportunity by id', async () => {
			const opportunityId = '67ba145c48ea4e5cdf5b5a0e';

			const spyFindOpportunityByIdRepo = jest
				.spyOn(opportunityRepository, 'findOpportunityById')
				.mockResolvedValue(null);

			const spyService = jest
				.spyOn(opportunityService, 'findOpportunityById')
				.mockRejectedValue(new NotFoundException('Opportunity not found'));

			await expect(
				opportunityService.findOpportunityById(opportunityId),
			).rejects.toThrow('Opportunity not found');

			await expect(
				opportunityService.findOpportunityById(opportunityId),
			).rejects.toMatchObject({
				response: {
					message: 'Opportunity not found',
					error: 'Not Found',
					statusCode: 404,
				},
			});

			expect(spyFindOpportunityByIdRepo).toHaveBeenCalledTimes(2);
			expect(spyService).toHaveBeenCalledTimes(2);
		});
	});
});

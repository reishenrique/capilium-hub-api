import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityService } from '../../opportunity/opportunity.service';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { createMock } from '@golevelup/ts-jest';
import { StatusEnum } from '../../common/enums/status.enum';

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
				applicants: [],
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
					applicants: expect.any(Array),
				}),
			);

			expect(spyCreateOpportunityRepo).toHaveBeenCalledTimes(1);
			expect(spyOpportunityService).toHaveBeenCalledTimes(1);
		});
	});
	describe('Error Cases', () => {});
});

import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityService } from '../../opportunity/opportunity.service';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { createMock } from '@golevelup/ts-jest';

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

	describe('Success Cases', () => {});
	describe('Error Cases', () => {});
});

import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityService } from '../../opportunity/opportunity.service';
import { UserService } from '../../users/user.service';
import { ApplicationService } from '../application.service';
import { ApplicationRepository } from '../repository/application.repository';
import { createMock } from '@golevelup/ts-jest';

describe('Application Service', () => {
	let applicationService: ApplicationService;
	let applicationRepository: ApplicationRepository;
	let userService: UserService;
	let opportunityService: OpportunityService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ApplicationService,
				{
					provide: ApplicationRepository,
					useValue: createMock<ApplicationRepository>(),
				},
				{
					provide: UserService,
					useValue: createMock<UserService>(),
				},
				{
					provide: OpportunityService,
					useValue: createMock<OpportunityService>,
				},
			],
		}).compile();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	describe('Success Cases', () => {});

	describe('Failure Cases', () => {});
});

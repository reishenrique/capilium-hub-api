import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityService } from '../../opportunity/opportunity.service';
import { UserService } from '../../users/user.service';
import { ApplicationService } from '../application.service';
import { ApplicationRepository } from '../repository/application.repository';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bull';
import { EMAIL_QUEUE } from '@app/shared';
import { StatusEnum } from '../../common/enums/status.enum';
import { NotFoundException } from '@nestjs/common/exceptions';

describe('Application Service', () => {
	let applicationService: ApplicationService;
	let applicationRepository: ApplicationRepository;

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
		);
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	describe('Success Cases', () => {
		it('Should create a new application', async () => {
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

			const mockUser = {
				_id: '67bcbbdb1477995f877ff4d1',
				firstName: 'Auth',
				lastName: 'Test',
				cpf: '47926193820',
				email: 'test@test.com',
				password: 'hash-password',
				profession: 'Dermatologist',
				specialization: ['Hair Transplant'],
				availabilityStatus: 'Available',
				professionalExperience: '3 years',
				portfolio: 'www.teste.com.br',
				createdAt: '2025-02-24T18:35:07.711Z',
				updatedAt: '2025-02-24T18:35:07.711Z',
			};

			const mockApplication = {
				_id: '67dc76395488f214f38a74db',
				opportunityId: '67ba145c48ea4e5cdf5b5a0e',
				userIds: ['67e45f92c7e1b53f5978c3e5'],
				createdAt: '2025-03-20T20:10:39.526Z',
				updatedAt: '2025-03-26T20:14:00.532Z',
				__v: 0,
			};

			const spyValidateOpportunityExists = jest
				.spyOn(applicationService, 'validateOpportunityExists')
				.mockResolvedValue(mockOpportunity);

			const spyValidateUserExists = jest
				.spyOn(applicationService, 'validateUserExists')
				.mockResolvedValue(mockUser);

			const spyCheckExistingAplication = jest
				.spyOn(applicationService, 'checkExistingApplicationAndUserApplied')
				.mockResolvedValue(null);

			const spyCreateApplicationRepository = jest
				.spyOn(applicationRepository, 'createApplication')
				.mockResolvedValue(mockApplication);

			const applicationPayload = {
				opportunityId: '67ba145c48ea4e5cdf5b5a0e',
				userId: '67e45f92c7e1b53f5978c3e5',
			};

			const newApplication =
				await applicationService.createApplication(applicationPayload);

			expect(newApplication.opportunityId).toBe(
				applicationPayload.opportunityId,
			);

			expect(spyValidateOpportunityExists).toHaveBeenCalledTimes(1);
			expect(spyValidateUserExists).toHaveBeenCalledTimes(1);
			expect(spyCheckExistingAplication).toHaveBeenCalledTimes(1);
			expect(spyCreateApplicationRepository).toHaveBeenCalledTimes(1);
		});
	});

	describe('Failure Cases', () => {
		it('Should throw a error when opportunity not exists', async () => {
			const applicationPayload = {
				opportunityId: '67ba145c48ea4e5cdf5b5a0e',
				userId: '67e45f92c7e1b53f5978c3e5',
			};

			const mockUser = {
				_id: '67bcbbdb1477995f877ff4d1',
				firstName: 'Auth',
				lastName: 'Test',
				cpf: '47926193820',
				email: 'test@test.com',
				password: 'hash-password',
				profession: 'Dermatologist',
				specialization: ['Hair Transplant'],
				availabilityStatus: 'Available',
				professionalExperience: '3 years',
				portfolio: 'www.teste.com.br',
				createdAt: '2025-02-24T18:35:07.711Z',
				updatedAt: '2025-02-24T18:35:07.711Z',
			};

			jest
				.spyOn(applicationService, 'validateOpportunityExists')
				.mockImplementation(() => {
					throw new NotFoundException('Opportunity does not exist');
				});

			jest
				.spyOn(applicationService, 'validateUserExists')
				.mockResolvedValue(mockUser);

			await expect(
				applicationService.createApplication(applicationPayload),
			).rejects.toThrow('Opportunity does not exist');
		});
	});
});

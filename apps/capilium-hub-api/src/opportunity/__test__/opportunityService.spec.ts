import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import EventEmitter2 from 'eventemitter2';
import { ClinicRepository } from '../../clinic/repository/clinic.repository';
import { ClinicDocument } from '../../clinic/schemas/clinic.schema';
import { StatusEnum } from '../../common/enums/status.enum';
import { createUserEntityMock } from '../../common/factories/user.factory';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { Opportunity } from '../../opportunity/entity/opportunity.entity';
import { OpportunityService } from '../../opportunity/opportunity.service';
import { OpportunityRepository } from '../../opportunity/repositories/opportunity.repository';
import { OpportunityDocument } from '../../opportunity/schemas/opportunity.schema';
import { UserRepository } from '../../users/repository/user.repository';

describe('Opportunity Service', () => {
	let opportunityService: OpportunityService;
	let opportunityRepository: OpportunityRepository;
	let cacheService: CacheService;
	let userRepository: UserRepository;
	let clinicRepository: ClinicRepository;

	const opportunityId = '67ba145c48ea4e5cdf5b5a0e';

	const createOpportunityDocumentMock = (
		overrides: Partial<Opportunity> & { _id?: string } = {},
	): OpportunityDocument => {
		const { _id = opportunityId, ...opportunityOverrides } = overrides;
		const opportunity = {
			title: 'Teste',
			description: 'Teste',
			location: 'Teste',
			salary: 100,
			status: StatusEnum.Open,
			clinicName: 'ClinicName',
			createdAt: new Date('2025-02-22T18:15:56.550Z'),
			updatedAt: new Date('2025-02-22T18:15:56.550Z'),
			__v: 0,
			...opportunityOverrides,
		};

		return {
			...opportunity,
			_id: { toString: () => _id },
			toObject: () => ({ ...opportunity, _id }),
		} as unknown as OpportunityDocument;
	};

	const createClinicDocumentMock = (
		clinicName: string,
		clinicId = 'clinic-id-1',
	): ClinicDocument =>
		({
			clinicName,
			_id: { toString: () => clinicId },
		}) as unknown as ClinicDocument;

	const toOpportunityResponse = (opportunity: OpportunityDocument) => ({
		...opportunity.toObject(),
		_id: opportunity._id.toString(),
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OpportunityService,
				{
					provide: OpportunityRepository,
					useValue: {
						create: jest.fn(),
						findOpportunityById: jest.fn(),
						findAllOpenedOpportunities: jest.fn(),
						deleteOpportunity: jest.fn(),
						updateOpportunity: jest.fn(),
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
						findClinicByCnpj: jest.fn(),
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
				{
					provide: EventEmitter2,
					useValue: {
						emit: jest.fn(),
					},
				},
			],
		}).compile();

		opportunityService = module.get<OpportunityService>(OpportunityService);
		opportunityRepository = module.get<OpportunityRepository>(
			OpportunityRepository,
		);
		cacheService = module.get<CacheService>(CacheService);
		userRepository = module.get<UserRepository>(UserRepository);
		clinicRepository = module.get<ClinicRepository>(ClinicRepository);
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

			jest.spyOn(userRepository, 'findUserById').mockResolvedValue(
				createUserEntityMock({
					isAdmin: true,
					clinicId: 'clinic-id-1',
				}) as any,
			);

			jest
				.spyOn(clinicRepository, 'findClinicById')
				.mockResolvedValue(createClinicDocumentMock('ClinicName'));

			const createdOpportunity =
				createOpportunityDocumentMock(opportunityPayload);

			const spyCreateOpportunityRepo = jest
				.spyOn(opportunityRepository, 'create')
				.mockResolvedValue(createdOpportunity);

			const spyOpportunityService = jest.spyOn(opportunityService, 'create');

			const opportunity = await opportunityService.create(
				opportunityPayload,
				'user-id-1',
			);

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

			jest.spyOn(userRepository, 'findUserById').mockResolvedValue(
				createUserEntityMock({
					isAdmin: true,
					clinicId: 'clinic-id-1',
				}) as any,
			);

			jest
				.spyOn(clinicRepository, 'findClinicById')
				.mockResolvedValue(createClinicDocumentMock('ClinicName'));

			const spyCreateOpportunityRepo = jest
				.spyOn(opportunityRepository, 'create')
				.mockResolvedValue(createOpportunityDocumentMock(opportunityPayload));

			const spyOpportunityService = jest.spyOn(opportunityService, 'create');

			const opportunity = await opportunityService.create(
				opportunityPayload,
				'user-id-1',
			);

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
			const opportunityDocument = createOpportunityDocumentMock();

			const spyFindOpportunityByIdRepo = jest
				.spyOn(opportunityRepository, 'findOpportunityById')
				.mockResolvedValue(opportunityDocument);

			const spyOpportunityService = jest.spyOn(
				opportunityService,
				'findOpportunityById',
			);

			const findOpportunityById =
				await opportunityService.findOpportunityById(opportunityId);

			expect(findOpportunityById).toEqual(
				toOpportunityResponse(opportunityDocument),
			);

			expect(spyFindOpportunityByIdRepo).toHaveBeenCalledTimes(1);
			expect(spyOpportunityService).toHaveBeenCalledTimes(1);
		});

		it('Should return opportunity from cache when available', async () => {
			const mockOpportunity = {
				_id: opportunityId,
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

			const spyCacheGet = jest
				.spyOn(cacheService, 'get')
				.mockResolvedValue(mockOpportunity);
			const spyFindOpportunityByIdRepo = jest.spyOn(
				opportunityRepository,
				'findOpportunityById',
			);

			const result =
				await opportunityService.findOpportunityById(opportunityId);

			expect(result).toEqual(mockOpportunity);
			expect(spyCacheGet).toHaveBeenCalledWith(`opportunity:${opportunityId}`);
			expect(spyFindOpportunityByIdRepo).not.toHaveBeenCalled();
		});

		it('Should save opportunity in cache after fetching from database', async () => {
			const opportunityDocument = createOpportunityDocumentMock();

			jest.spyOn(cacheService, 'get').mockResolvedValue(null);
			jest
				.spyOn(opportunityRepository, 'findOpportunityById')
				.mockResolvedValue(opportunityDocument);
			const spyCacheSet = jest
				.spyOn(cacheService, 'set')
				.mockResolvedValue(undefined);

			await opportunityService.findOpportunityById(opportunityId);

			expect(spyCacheSet).toHaveBeenCalledWith(
				`opportunity:${opportunityId}`,
				opportunityDocument,
			);
		});

		it('Should return opportunities from cache when available', async () => {
			const mockOpportunities = [
				{
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
				},
			];

			const spyCacheGet = jest
				.spyOn(cacheService, 'get')
				.mockResolvedValue(mockOpportunities);
			const spyFindAllRepo = jest.spyOn(
				opportunityRepository,
				'findAllOpenedOpportunities',
			);

			const result = await opportunityService.findAllOpenedOpportunities();

			expect(result).toEqual(mockOpportunities);
			expect(spyCacheGet).toHaveBeenCalledWith('opportunities:opened');
			expect(spyFindAllRepo).not.toHaveBeenCalled();
		});

		it('Should save opportunities in cache after fetching from database', async () => {
			const opportunityDocuments = [createOpportunityDocumentMock()];

			jest.spyOn(cacheService, 'get').mockResolvedValue(null);
			jest
				.spyOn(opportunityRepository, 'findAllOpenedOpportunities')
				.mockResolvedValue(opportunityDocuments);
			const spyCacheSet = jest
				.spyOn(cacheService, 'set')
				.mockResolvedValue(undefined);

			await opportunityService.findAllOpenedOpportunities();

			expect(spyCacheSet).toHaveBeenCalledWith(
				'opportunities:opened',
				opportunityDocuments.map(toOpportunityResponse),
			);
		});

		it('Should return empty array when there are no open opportunities', async () => {
			jest.spyOn(cacheService, 'get').mockResolvedValue(null);
			jest
				.spyOn(opportunityRepository, 'findAllOpenedOpportunities')
				.mockResolvedValue([]);

			const result = await opportunityService.findAllOpenedOpportunities();

			expect(result).toEqual([]);
			expect(cacheService.set).not.toHaveBeenCalled();
		});

		it('Should delete opportunity and invalidate cache', async () => {
			const opportunityDocument = createOpportunityDocumentMock({
				clinicId: 'clinic-id-1',
			});

			jest
				.spyOn(opportunityRepository, 'findOpportunityById')
				.mockResolvedValue(opportunityDocument);

			jest
				.spyOn(opportunityRepository, 'deleteOpportunity')
				.mockResolvedValue(undefined);

			const spyCacheDelete = jest
				.spyOn(cacheService, 'delete')
				.mockResolvedValue(undefined);

			await opportunityService.deleteOpportunityById(opportunityId, {
				id: 'admin-id',
				isAdmin: true,
				clinicId: 'clinic-id-1',
			});

			expect(spyCacheDelete).toHaveBeenCalledWith(
				`opportunity:${opportunityId}`,
			);
			expect(spyCacheDelete).toHaveBeenCalledWith('clinic:activated');
			expect(spyCacheDelete).toHaveBeenCalledWith('opportunities:opened');
			expect(opportunityRepository.deleteOpportunity).toHaveBeenCalledWith(
				opportunityId,
			);
		});

		it('Should update opportunity and invalidate cache', async () => {
			const opportunityDocument = createOpportunityDocumentMock({
				clinicId: 'clinic-id-1',
			});
			const updatedOpportunity = createOpportunityDocumentMock({
				title: 'Updated Opportunity Title',
				clinicId: 'clinic-id-1',
			});

			jest
				.spyOn(opportunityRepository, 'findOpportunityById')
				.mockResolvedValue(opportunityDocument);

			const spyUpdateOpportunityRepo = jest
				.spyOn(opportunityRepository, 'updateOpportunity')
				.mockResolvedValue(updatedOpportunity);

			const spyCacheDelete = jest
				.spyOn(cacheService, 'delete')
				.mockResolvedValue(undefined);

			const result = await opportunityService.updateOpportunityById(
				opportunityId,
				{ title: 'Updated Opportunity Title' },
				{
					id: 'admin-id',
					isAdmin: true,
					clinicId: 'clinic-id-1',
				},
			);

			expect(result).toEqual(toOpportunityResponse(updatedOpportunity));
			expect(spyUpdateOpportunityRepo).toHaveBeenCalledWith(
				opportunityDocument,
				{ title: 'Updated Opportunity Title' },
			);
			expect(spyCacheDelete).toHaveBeenCalledWith(
				`opportunity:${opportunityId}`,
			);
			expect(spyCacheDelete).toHaveBeenCalledWith('clinic:activated');
			expect(spyCacheDelete).toHaveBeenCalledWith('opportunities:opened');
		});

		it('Should throw BadRequestException when user is not admin', async () => {
			jest
				.spyOn(userRepository, 'findUserById')
				.mockResolvedValue(createUserEntityMock({ isAdmin: false }) as any);

			await expect(
				opportunityService.create(
					{
						title: 'Teste',
						description: 'Teste',
						location: 'Teste',
						salary: 100,
						status: StatusEnum.Open,
					} as any,
					'user-id-1',
				),
			).rejects.toThrow(BadRequestException);

			expect(opportunityRepository.create).not.toHaveBeenCalled();
		});

		it('Should create opportunity with clinicName from clinic', async () => {
			jest.spyOn(userRepository, 'findUserById').mockResolvedValue(
				createUserEntityMock({
					isAdmin: true,
					clinicId: 'clinic-id-1',
				}) as any,
			);
			jest
				.spyOn(clinicRepository, 'findClinicById')
				.mockResolvedValue(createClinicDocumentMock('Real Clinic Name'));
			jest.spyOn(opportunityRepository, 'create').mockResolvedValue(
				createOpportunityDocumentMock({
					title: 'Teste',
					description: 'Teste',
					location: 'Teste',
					salary: 100,
					status: StatusEnum.Open,
					clinicName: 'Real Clinic Name',
				}),
			);

			const result = await opportunityService.create(
				{
					title: 'Teste',
					description: 'Teste',
					location: 'Teste',
					salary: 100,
					status: StatusEnum.Open,
				} as any,
				'user-id-1',
			);

			expect(result.clinicName).toBe('Real Clinic Name');
			expect(opportunityRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({ clinicName: 'Real Clinic Name' }),
			);
		});
	});
	describe('Error Cases', () => {
		it('Should return an exception when not returning a opportunity by id', async () => {
			const spyFindOpportunityByIdRepo = jest
				.spyOn(opportunityRepository, 'findOpportunityById')
				.mockResolvedValue(null);

			jest.spyOn(cacheService, 'get').mockResolvedValue(null);

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
		});
	});
});

import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import EventEmitter2 from 'eventemitter2';
import { ClinicService } from '../../clinic/clinic.service';
import { CliniCreateDto } from '../../clinic/dto/clinicCreateDto';
import { Clinic } from '../../clinic/entity/clinic.entity';
import { ClinicRepository } from '../../clinic/repository/clinic.repository';
import { ClinicDocument } from '../../clinic/schemas/clinic.schema';
import { SocialNetworksEnum } from '../../common/enums/social-networks.enum';
import { SpecializationEnum } from '../../common/enums/specialization.enum';
import { CacheService } from '../../infrastructure/cache/cache.service';

describe('ClinicService', () => {
	let clinicService: ClinicService;
	let clinicRepository: jest.Mocked<ClinicRepository>;
	let cacheService: jest.Mocked<CacheService>;

	const clinicId = '67a533b05a3a53013177cb1e';

	const createClinicPayload = (
		overrides: Partial<CliniCreateDto> = {},
	): CliniCreateDto => ({
		clinicName: 'Teste',
		address: 'Teste numero 3',
		contact: '1111112222',
		socialNetworks: SocialNetworksEnum.INSTAGRAM,
		specializations: SpecializationEnum.HairTransplant,
		corporateName: 'Nome Generico',
		cnpj: '22345652912348',
		openingDays: 7,
		technicalManager: 'Test',
		active: true,
		...overrides,
	});

	const createClinicDocumentMock = (
		overrides: Partial<Clinic> & { _id?: string } = {},
	): ClinicDocument => {
		const { _id = clinicId, ...clinicOverrides } = overrides;
		const clinic = {
			...createClinicPayload(clinicOverrides),
			createdAt: new Date('2025-02-06T22:12:00.989Z'),
			updatedAt: new Date('2025-02-06T22:12:00.989Z'),
			__v: 0,
		};

		return {
			...clinic,
			_id: { toString: () => _id },
			toObject: () => ({ ...clinic, _id }),
		} as unknown as ClinicDocument;
	};

	const toClinicResponse = (clinic: ClinicDocument) => ({
		...clinic.toObject(),
		_id: clinic._id.toString(),
	});

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ClinicService,
				{
					provide: ClinicRepository,
					useValue: {
						createClinic: jest.fn(),
						findClinicByCnpj: jest.fn(),
						findClinicById: jest.fn(),
						findAllActivatedClinics: jest.fn(),
						findClinicByIdAndUpdate: jest.fn(),
						deleteClinicById: jest.fn(),
						getPaginatedClinics: jest.fn(),
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

		clinicService = module.get<ClinicService>(ClinicService);
		clinicRepository = module.get(ClinicRepository);
		cacheService = module.get(CacheService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('creates a clinic when the cnpj is not registered', async () => {
			const clinicPayload = createClinicPayload();
			const clinicDocument = createClinicDocumentMock();

			clinicRepository.findClinicByCnpj.mockResolvedValue(null);
			clinicRepository.createClinic.mockResolvedValue(clinicDocument);

			const result = await clinicService.create(clinicPayload);

			expect(clinicRepository.findClinicByCnpj).toHaveBeenCalledWith(
				clinicPayload.cnpj,
			);
			expect(clinicRepository.createClinic).toHaveBeenCalledWith(clinicPayload);
			expect(result).toEqual(toClinicResponse(clinicDocument));
		});

		it('throws ConflictException when the cnpj is already registered', async () => {
			const clinicPayload = createClinicPayload();

			clinicRepository.findClinicByCnpj.mockResolvedValue(
				createClinicDocumentMock(),
			);

			await expect(clinicService.create(clinicPayload)).rejects.toThrow(
				ConflictException,
			);

			expect(clinicRepository.createClinic).not.toHaveBeenCalled();
		});
	});

	describe('findAllActivatedClinics', () => {
		it('returns the mapped clinics and caches them when the cache is empty', async () => {
			const clinicDocuments = [
				createClinicDocumentMock({ cnpj: '12345652912348' }),
				createClinicDocumentMock({ _id: '67a533d45a3a53013177cb22' }),
			];

			cacheService.get.mockResolvedValue(undefined);
			clinicRepository.findAllActivatedClinics.mockResolvedValue(
				clinicDocuments,
			);

			const result = await clinicService.findAllActivatedClinics();

			expect(result).toEqual(clinicDocuments.map(toClinicResponse));
			expect(cacheService.set).toHaveBeenCalledWith(
				'clinic:activated',
				clinicDocuments,
			);
		});

		it('returns the cached clinics without querying the repository', async () => {
			const cachedClinics = [toClinicResponse(createClinicDocumentMock())];

			cacheService.get.mockResolvedValue(cachedClinics);

			const result = await clinicService.findAllActivatedClinics();

			expect(result).toEqual(cachedClinics);
			expect(clinicRepository.findAllActivatedClinics).not.toHaveBeenCalled();
		});

		it('returns an empty list and skips the cache when there are no active clinics', async () => {
			cacheService.get.mockResolvedValue(undefined);
			clinicRepository.findAllActivatedClinics.mockResolvedValue([]);

			const result = await clinicService.findAllActivatedClinics();

			expect(result).toEqual([]);
			expect(cacheService.set).not.toHaveBeenCalled();
		});
	});

	describe('findClinicById', () => {
		it('returns the mapped clinic and caches it when the cache is empty', async () => {
			const clinicDocument = createClinicDocumentMock();

			cacheService.get.mockResolvedValue(undefined);
			clinicRepository.findClinicById.mockResolvedValue(clinicDocument);

			const result = await clinicService.findClinicById(clinicId);

			expect(clinicRepository.findClinicById).toHaveBeenCalledWith(clinicId);
			expect(cacheService.set).toHaveBeenCalledWith(
				`clinic:${clinicId}`,
				clinicDocument,
			);
			expect(result).toEqual(toClinicResponse(clinicDocument));
		});

		it('returns the cached clinic without querying the repository', async () => {
			const cachedClinic = toClinicResponse(createClinicDocumentMock());

			cacheService.get.mockResolvedValue(cachedClinic);

			const result = await clinicService.findClinicById(clinicId);

			expect(result).toEqual(cachedClinic);
			expect(clinicRepository.findClinicById).not.toHaveBeenCalled();
		});

		it('throws BadRequestException when no id is provided', async () => {
			await expect(clinicService.findClinicById('')).rejects.toThrow(
				BadRequestException,
			);

			expect(clinicRepository.findClinicById).not.toHaveBeenCalled();
		});

		it('throws NotFoundException when the clinic does not exist', async () => {
			cacheService.get.mockResolvedValue(undefined);
			clinicRepository.findClinicById.mockResolvedValue(null);

			await expect(clinicService.findClinicById(clinicId)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('updateClinicById', () => {
		it('updates the clinic and invalidates its caches', async () => {
			const clinicDocument = createClinicDocumentMock({ clinicName: 'Novo' });

			clinicRepository.findClinicByIdAndUpdate.mockResolvedValue(
				clinicDocument,
			);

			const result = await clinicService.updateClinicById(clinicId, {
				clinicName: 'Novo',
			});

			expect(clinicRepository.findClinicByIdAndUpdate).toHaveBeenCalledWith(
				clinicId,
				{ clinicName: 'Novo' },
			);
			expect(cacheService.delete).toHaveBeenCalledWith(`clinic:${clinicId}`);
			expect(cacheService.delete).toHaveBeenCalledWith('clinic:activated');
			expect(result).toEqual(toClinicResponse(clinicDocument));
		});

		it('throws NotFoundException when the clinic does not exist', async () => {
			clinicRepository.findClinicByIdAndUpdate.mockResolvedValue(null);

			await expect(
				clinicService.updateClinicById(clinicId, { clinicName: 'Novo' }),
			).rejects.toThrow(NotFoundException);

			expect(cacheService.delete).not.toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('deletes the clinic and invalidates its caches', async () => {
			clinicRepository.findClinicById.mockResolvedValue(
				createClinicDocumentMock(),
			);
			clinicRepository.deleteClinicById.mockResolvedValue(undefined);

			await expect(clinicService.delete(clinicId)).resolves.toBeUndefined();

			expect(clinicRepository.deleteClinicById).toHaveBeenCalledWith(clinicId);
			expect(cacheService.delete).toHaveBeenCalledWith(`clinic:${clinicId}`);
			expect(cacheService.delete).toHaveBeenCalledWith('clinic:activated');
		});

		it('throws BadRequestException when no id is provided', async () => {
			await expect(clinicService.delete('')).rejects.toThrow(
				BadRequestException,
			);

			expect(clinicRepository.deleteClinicById).not.toHaveBeenCalled();
		});

		it('throws NotFoundException when the clinic does not exist', async () => {
			clinicRepository.findClinicById.mockResolvedValue(null);

			await expect(clinicService.delete(clinicId)).rejects.toThrow(
				NotFoundException,
			);

			expect(clinicRepository.deleteClinicById).not.toHaveBeenCalled();
		});
	});

	describe('getPagedAllClinics', () => {
		it('returns the paginated clinics', async () => {
			const clinicDocument = createClinicDocumentMock();
			const paginatedResult = {
				totalDocuments: 1,
				totalPages: 1,
				currentPage: 1,
				results: [clinicDocument],
			};

			clinicRepository.getPaginatedClinics.mockResolvedValue(paginatedResult);

			const result = await clinicService.getPagedAllClinics(1, 10);

			expect(clinicRepository.getPaginatedClinics).toHaveBeenCalledWith(1, 10);
			expect(result).toEqual(paginatedResult);
		});

		it('throws BadRequestException when page or limit is not positive', async () => {
			await expect(clinicService.getPagedAllClinics(0, 10)).rejects.toThrow(
				BadRequestException,
			);
			await expect(clinicService.getPagedAllClinics(1, 0)).rejects.toThrow(
				BadRequestException,
			);

			expect(clinicRepository.getPaginatedClinics).not.toHaveBeenCalled();
		});

		it('throws NotFoundException when the repository returns nothing', async () => {
			clinicRepository.getPaginatedClinics.mockResolvedValue(null);

			await expect(clinicService.getPagedAllClinics(1, 10)).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});

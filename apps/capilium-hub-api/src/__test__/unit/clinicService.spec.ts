import { Test, TestingModule } from '@nestjs/testing';
import { ClinicService } from '../../clinic/clinic.service';
import { ClinicRepository } from '../../clinic/repository/clinic.repository';
import { createMock } from '@golevelup/ts-jest';
import { SocialNetworksEnum } from '../../common/enums/social-networks.enum';
import { SpecializationEnum } from '../../common/enums/specialization.enum';

describe('Clinic Service', () => {
	let clinicService: ClinicService;
	let clinicRepository: ClinicRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ClinicService,
				{
					provide: ClinicRepository,
					useValue: createMock<ClinicRepository>(),
				},
			],
		}).compile();

		clinicService = module.get<ClinicService>(ClinicService);
		clinicRepository = module.get<ClinicRepository>(ClinicRepository);
	});

	afterAll(() => {
		jest.clearAllMocks();
	});
	describe('Success Cases', () => {
		it('Should create a new clinic', async () => {
			const clinicPayload = {
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
			};

			const spyClinicService = jest.spyOn(clinicService, 'create');

			const spyCreateClinicRepo = jest
				.spyOn(clinicRepository, 'createClinic')
				.mockResolvedValue(clinicPayload);

			const spyFindClinicByCnpjRepo = jest
				.spyOn(clinicRepository, 'findClinicByCnpj')
				.mockResolvedValue(null);

			const clinic = await clinicService.create(clinicPayload);

			expect(clinic.clinicName).toBe(clinicPayload.clinicName);
			expect(clinic.cnpj).toBe(clinicPayload.cnpj);
			expect(clinic.active).toBe(true);

			expect(clinic).toEqual(
				expect.objectContaining({
					clinicName: expect.any(String),
					address: expect.any(String),
					contact: expect.any(String),
					socialNetworks: expect.any(String),
					specializations: expect.any(String),
					corporateName: expect.any(String),
					cnpj: expect.any(String),
					openingDays: expect.any(Number),
					technicalManager: expect.any(String),
					active: expect.any(Boolean),
				}),
			);

			expect(spyCreateClinicRepo).toHaveBeenCalledTimes(1);
			expect(spyFindClinicByCnpjRepo).toHaveBeenCalledTimes(1);

			expect(spyClinicService).toHaveBeenCalledTimes(1);
		});

		it('Should return active clinics', async () => {
			const mockActiveClinics = [
				{
					_id: '67a533b05a3a53013177cb1e',
					clinicName: 'Teste',
					address: 'Teste numero 3',
					contact: '1111112222',
					socialNetworks: SocialNetworksEnum.INSTAGRAM,
					specializations: SpecializationEnum.HairTransplant,
					corporateName: 'Nome Generico',
					cnpj: '12345652912348',
					openingDays: 7,
					technicalManager: 'Fernanda',
					active: true,
					createdAt: '2025-02-06T22:12:00.989Z',
					updatedAt: '2025-02-06T22:12:00.989Z',
					__v: 0,
				},
				{
					_id: '67a533d45a3a53013177cb22',
					clinicName: 'Teste',
					address: 'Teste numero 3',
					contact: '1111112222',
					socialNetworks: SocialNetworksEnum.INSTAGRAM,
					specializations: SpecializationEnum.HairTransplant,
					corporateName: 'Nome Generico',
					cnpj: '22345652912348',
					openingDays: 7,
					technicalManager: 'Fernanda',
					active: true,
					createdAt: '2025-02-06T22:12:36.671Z',
					updatedAt: '2025-02-06T22:12:36.671Z',
					__v: 0,
				},
			];

			const spyFindAllActivatedClinicsRepo = jest
				.spyOn(clinicRepository, 'findAllActivatedClinics')
				.mockResolvedValue(mockActiveClinics);

			const spyClinicService = jest.spyOn(
				clinicRepository,
				'findAllActivatedClinics',
			);

			const findAllActivatedClinics =
				await clinicService.findAllActivatedClinics();

			expect(findAllActivatedClinics).toBe(mockActiveClinics);

			expect(spyFindAllActivatedClinicsRepo).toHaveBeenCalledTimes(1);
			expect(spyClinicService).toHaveBeenCalledTimes(1);
		});
	});
	describe('Failure Cases', () => {
		it('Should throw a conflict exception when cnpj already registered', async () => {
			const clinicPayload = {
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
			};

			const spyService = jest.spyOn(clinicService, 'create');

			const spyCreateClinicRepo = jest.spyOn(clinicRepository, 'createClinic');

			const spyFindClinicByCnpjRepo = jest
				.spyOn(clinicRepository, 'findClinicByCnpj')
				.mockResolvedValue(clinicPayload);

			await expect(clinicService.create(clinicPayload)).rejects.toThrow(
				'CNPJ already registered in the system',
			);

			await expect(clinicService.create(clinicPayload)).rejects.toMatchObject({
				response: {
					message: 'CNPJ already registered in the system',
					error: 'Conflict',
					statusCode: 409,
				},
			});

			expect(spyCreateClinicRepo).not.toHaveBeenCalled();

			expect(spyFindClinicByCnpjRepo).toHaveBeenCalledTimes(2);
			expect(spyService).toHaveBeenCalledTimes(2);
		});
	});
});

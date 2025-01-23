import { AvailabilityStatusEnum } from 'src/users/enum/availability.enum';
import { ProfessionEnum } from 'src/users/enum/profession.enum';
import { SpecializationEnum } from 'src/users/enum/specialization.enum';
import { UserRepository } from 'src/users/repository/user.repository';
import { UserService } from 'src/users/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CacheService } from 'src/infrastructure/cache/cache.service';

describe('User Service', () => {
	let userService: UserService;
	let userRepository: UserRepository;
	let cacheService: CacheService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: UserRepository,
					useValue: createMock<UserRepository>(),
				},
				{
					provide: CacheService,
					useValue: createMock<CacheService>(),
				},
			],
		}).compile();

		userService = module.get<UserService>(UserService);
		userRepository = module.get<UserRepository>(UserRepository);
		cacheService = module.get<CacheService>(CacheService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Success Cases', () => {
		it('Should create a new user', async () => {
			const userPayload = {
				firstName: 'John',
				lastName: 'Doe',
				cpf: '11122233344',
				email: 'johndoe@test.com',
				password: 'TestPassword',
				profession: ProfessionEnum.Anesthesiologist,
				specialization: [SpecializationEnum.HairTransplant],
				availabilityStatus: AvailabilityStatusEnum.Available,
				professionalExperience: '3 years',
				portfolio: 'www.teste.com.br',
			};

			const spyCreateUserMethodService = jest.spyOn(userService, 'newUser');

			const spyCreateUserRepo = jest
				.spyOn(userRepository, 'createUser')
				.mockResolvedValue(userPayload);

			const spyFindUserByCpfMethodRepo = jest
				.spyOn(userRepository, 'findUserByCpf')
				.mockResolvedValue(null);

			const spyFindUserByEmailMethodRepo = jest
				.spyOn(userRepository, 'findUserByEmail')
				.mockResolvedValue(null);

			const newUser = await userService.newUser(userPayload);

			expect(newUser.firstName).toBe(userPayload.firstName);
			expect(newUser.lastName).toBe(userPayload.lastName);
			expect(newUser.email).toBe(userPayload.email);

			expect(newUser).toEqual(
				expect.objectContaining({
					firstName: expect.any(String),
					lastName: expect.any(String),
					cpf: expect.any(String),
					email: expect.any(String),
					password: expect.any(String),
					profession: expect.any(String),
					specialization: expect.any(Array),
					availabilityStatus: expect.any(String),
					professionalExperience: expect.any(String),
					portfolio: expect.any(String),
				}),
			);

			expect(spyCreateUserMethodService).toHaveBeenCalledTimes(1);
			expect(spyFindUserByCpfMethodRepo).toHaveBeenCalledTimes(1);
			expect(spyFindUserByEmailMethodRepo).toHaveBeenCalledTimes(1);
			expect(spyCreateUserRepo).toHaveBeenCalledTimes(1);
		});

		it('Should return a user by their id', async () => {
			const userIdMock = '6767097fc93116ce0f5a9509';

			const userPayloadResponse = {
				_id: '6767097fc93116ce0f5a9509',
				firstName: 'John',
				lastName: 'Doe',
				cpf: '11122233345',
				email: 'johndoe@test.com',
				profession: ProfessionEnum.Anesthesiologist,
				specialization: [SpecializationEnum.HairTransplant],
				availabilityStatus: AvailabilityStatusEnum.Available,
				professionalExperience: '3 years',
				portfolio: 'www.teste.com.br',
				createdAt: '2024-12-21T18:31:27.286Z',
				updatedAt: '2024-12-21T18:31:27.286Z',
				__v: 0,
			};

			const spyGetCacheValue = jest
				.spyOn(cacheService, 'getCacheValue')
				.mockResolvedValue(null);

			const spyCacheValue = jest
				.spyOn(cacheService, 'cacheValue')
				.mockResolvedValue(true);

			const spyFindUserByIdRepo = jest
				.spyOn(userRepository, 'findUserById')
				.mockResolvedValue(userPayloadResponse);

			const spyFindUserByIdService = jest.spyOn(userService, 'findUserById');

			const findUserById = await userService.findUserById(userIdMock);

			expect(findUserById).toEqual(userPayloadResponse);

			expect(spyGetCacheValue).toHaveBeenCalledTimes(1);
			expect(spyCacheValue).toHaveBeenCalledTimes(1);
			expect(spyFindUserByIdRepo).toHaveBeenCalledTimes(1);
			expect(spyFindUserByIdService).toHaveBeenCalledTimes(1);
		});

		it('Should return a user by their cpf', async () => {
			const mockUserCpf = '11122233345';

			const userPayloadResponse = {
				_id: '6767097fc93116ce0f5a9509',
				firstName: 'John',
				lastName: 'Doe',
				cpf: '11122233345',
				email: 'johndoe@test.com',
				profession: ProfessionEnum.Anesthesiologist,
				specialization: [SpecializationEnum.HairTransplant],
				availabilityStatus: AvailabilityStatusEnum.Available,
				professionalExperience: '3 years',
				portfolio: 'www.teste.com.br',
				createdAt: '2024-12-21T18:31:27.286Z',
				updatedAt: '2024-12-21T18:31:27.286Z',
				__v: 0,
			};

			const spyFindUserByCpfRepo = jest
				.spyOn(userRepository, 'findUserByCpf')
				.mockResolvedValue(userPayloadResponse);

			const spyFindUserByCpfService = jest.spyOn(userService, 'findUserByCpf');

			const findUserById = await userService.findUserByCpf(mockUserCpf);

			expect(findUserById).toEqual(userPayloadResponse);

			expect(spyFindUserByCpfRepo).toHaveBeenCalledTimes(1);
			expect(spyFindUserByCpfService).toHaveBeenCalledTimes(1);
		});
	});

	describe('Error Cases', () => {
		it('Should throw an error if CPF already exists', async () => {
			const userPayload = {
				firstName: 'John',
				lastName: 'Doe',
				cpf: '11122233344',
				email: 'johndoe@test.com',
				password: 'TestPassword',
				profession: ProfessionEnum.Anesthesiologist,
				specialization: [SpecializationEnum.HairTransplant],
				availabilityStatus: AvailabilityStatusEnum.Available,
				professionalExperience: '3 years',
				portfolio: 'www.teste.com.br',
			};

			const spyCreateUserMethodRepo = jest.spyOn(userRepository, 'createUser');

			const spyFindUserByCpfMethodRepo = jest
				.spyOn(userRepository, 'findUserByCpf')
				.mockResolvedValue(userPayload);

			const spyCreateUserMethodService = jest.spyOn(userService, 'newUser');

			await expect(userService.newUser(userPayload)).rejects.toThrow(
				'CPF already registered in the system',
			);

			await expect(userService.newUser(userPayload)).rejects.toMatchObject({
				response: {
					message: 'CPF already registered in the system',
					error: 'Conflict',
					statusCode: 409,
				},
			});

			expect(spyFindUserByCpfMethodRepo).toHaveBeenCalledTimes(2);
			expect(spyCreateUserMethodService).toHaveBeenCalledTimes(2);

			expect(spyCreateUserMethodRepo).not.toHaveBeenCalled();
		});

		it('Should throw an error if email already exists', async () => {
			const userPayload = {
				firstName: 'John',
				lastName: 'Doe',
				cpf: '5556667780',
				email: 'johndoe@test.com',
				password: 'TestPassword',
				profession: ProfessionEnum.Anesthesiologist,
				specialization: [SpecializationEnum.HairTransplant],
				availabilityStatus: AvailabilityStatusEnum.Available,
				professionalExperience: '3 years',
				portfolio: 'www.teste.com.br',
			};

			const spyCreateUserMethodRepo = jest.spyOn(userRepository, 'createUser');

			const spyFindUserByCpfMethodRepo = jest
				.spyOn(userRepository, 'findUserByCpf')
				.mockResolvedValue(null);

			const spyFindUserByEmailMethodRepo = jest
				.spyOn(userRepository, 'findUserByEmail')
				.mockResolvedValue(userPayload);

			const spyCreateUserMethodService = jest.spyOn(userService, 'newUser');

			await expect(userService.newUser(userPayload)).rejects.toThrow(
				'Email already registered in the system',
			);

			await expect(userService.newUser(userPayload)).rejects.toMatchObject({
				response: {
					message: 'Email already registered in the system',
					error: 'Conflict',
					statusCode: 409,
				},
			});

			expect(spyFindUserByCpfMethodRepo).toHaveBeenCalledTimes(2);
			expect(spyFindUserByEmailMethodRepo).toHaveBeenCalledTimes(2);
			expect(spyCreateUserMethodService).toHaveBeenCalledTimes(2);

			expect(spyCreateUserMethodRepo).not.toHaveBeenCalled();
		});
	});
});

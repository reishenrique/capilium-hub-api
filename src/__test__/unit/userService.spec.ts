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
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

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

		const spyCreateUserMethod = jest.spyOn(userService, 'newUser');

		const spyCreateUser = jest
			.spyOn(userRepository, 'createUser')
			.mockResolvedValue(userPayload);

		const spyFindUserByCpfMethod = jest
			.spyOn(userRepository, 'getUserByCpf')
			.mockResolvedValue(null);

		const spyFindUserByEmailMethod = jest
			.spyOn(userRepository, 'getUserByEmail')
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

		expect(spyCreateUser).toHaveBeenCalledTimes(1);
		expect(spyFindUserByCpfMethod).toHaveBeenCalledTimes(1);
		expect(spyFindUserByEmailMethod).toHaveBeenCalledTimes(1);
		expect(spyCreateUserMethod).toHaveBeenCalledTimes(1);
	});
});

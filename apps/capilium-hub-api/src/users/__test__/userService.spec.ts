import { EMAIL_QUEUE } from '@app/shared';
import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';
import { getQueueToken } from '@nestjs/bull';
import {
	ConflictException,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { Queue } from 'bull';
import EventEmitter2 from 'eventemitter2';
import { ClinicRepository } from '../../clinic/repository/clinic.repository';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { LogEventEnum } from '../../logger/enum/log-event.enum';
import { LogLevelEnum } from '../../logger/enum/log-level.enum';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../user.service';
import {
	createUserEntityMock,
	createUserMock,
	createUserResponseMock,
} from '../../common/factories/user.factory';

describe('UserService', () => {
	let service: UserService;
	let userRepository: jest.Mocked<UserRepository>;
	let clinicRepository: jest.Mocked<ClinicRepository>;
	let cacheService: jest.Mocked<CacheService>;
	let emailQueue: jest.Mocked<Queue>;
	let eventEmitter: jest.Mocked<EventEmitter2>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: UserRepository,
					useValue: {
						findUserByCpf: jest.fn(),
						findUserByEmail: jest.fn(),
						findUserById: jest.fn(),
						findUserByIdAndUpdate: jest.fn(),
						createUser: jest.fn(),
						deleteUserById: jest.fn(),
					},
				},
				{
					provide: ClinicRepository,
					useValue: {
						findClinicByCnpj: jest.fn(),
					},
				},
				{
					provide: CacheService,
					useValue: {
						get: jest.fn(),
						set: jest.fn(),
					},
				},
				{
					provide: getQueueToken(EMAIL_QUEUE),
					useValue: {
						add: jest.fn(),
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

		service = module.get<UserService>(UserService);
		userRepository = module.get(UserRepository);
		clinicRepository = module.get(ClinicRepository);
		cacheService = module.get(CacheService);
		emailQueue = module.get(getQueueToken(EMAIL_QUEUE));
		eventEmitter = module.get(EventEmitter2);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		beforeEach(() => {
			userRepository.findUserByCpf.mockResolvedValue(null);
			userRepository.findUserByEmail.mockResolvedValue(null);
			userRepository.createUser.mockResolvedValue(createUserEntityMock());
			emailQueue.add.mockResolvedValue({} as any);
		});

		it('should successfully create a user', async () => {
			const mockUser = createUserEntityMock();
			userRepository.createUser.mockResolvedValue(mockUser);

			const payload = createUserMock();
			const result = await service.create(payload);

			expect(result).toEqual(mockUser);
			expect(userRepository.createUser).toHaveBeenCalledTimes(1);
		});

		it('should throw ConflictException when CPF is already registered', async () => {
			userRepository.findUserByCpf.mockResolvedValue(createUserEntityMock());

			await expect(service.create(createUserEntityMock())).rejects.toThrow(
				ConflictException,
			);
			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('should throw ConflictException when email is already registered', async () => {
			userRepository.findUserByEmail.mockResolvedValue(createUserEntityMock());

			await expect(service.create(createUserEntityMock())).rejects.toThrow(
				ConflictException,
			);
			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('should throw BadRequestException when isAdmin=true and clinicCnpj is not provided', async () => {
			await expect(
				service.create(
					createUserEntityMock({ isAdmin: true, clinicId: undefined }),
				),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw NotFoundException when clinicCnpj does not match any clinic', async () => {
			clinicRepository.findClinicByCnpj.mockResolvedValue(null);

			await expect(
				service.create(
					createUserMock({ isAdmin: true, clinicCnpj: '12345678000100' }),
				),
			).rejects.toThrow(NotFoundException);
		});

		it('should associate clinicId with the user when isAdmin=true and the clinic is found', async () => {
			const mockClinic = { _id: 'clinic-id-1', cnpj: '12345678000100' };
			clinicRepository.findClinicByCnpj.mockResolvedValue(mockClinic as any);

			await service.create(
				createUserMock({ isAdmin: true, clinicCnpj: '12345678000100' }),
			);

			expect(userRepository.createUser).toHaveBeenCalledWith(
				expect.objectContaining({ clinicId: 'clinic-id-1' }),
			);
		});

		it('should send a welcome email after creating the user', async () => {
			const mockUser = createUserEntityMock();

			userRepository.findUserByEmail
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(mockUser as any);

			await service.create(createUserMock());

			expect(emailQueue.add).toHaveBeenCalledWith(
				'send-email',
				expect.objectContaining({
					to: 'johndoe@test.com',
					metadata: expect.objectContaining({
						emailType: EmailTypeEnum.WELCOME,
					}),
				}),
			);
		});

		it('should emit a successful log event after creating the user', async () => {
			await service.create(createUserEntityMock());

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({
					level: LogLevelEnum.Success,
					message: 'Creating a new user',
				}),
			);
		});

		it('should hash the password before creating the user', async () => {
			const payload = createUserEntityMock({ password: '123@Test' });
			await service.create(payload);

			const createUserCall = userRepository.createUser.mock.calls[0][0];
			expect(createUserCall.password).not.toBe('123@Test');
			expect(createUserCall.password).toMatch(/^\$2[ab]\$\d+\$/);
		});
	});

	describe('findUserById', () => {
		it('should return the user from the cache when available', async () => {
			const mockUser = createUserResponseMock();
			cacheService.get.mockResolvedValue(mockUser);

			const result = await service.findUserById('user-id-1');

			expect(result).toEqual(mockUser);
			expect(userRepository.findUserById).not.toHaveBeenCalled();
		});

		it('should fetch the user from the database when not available in the cache', async () => {
			const mockUser = createUserEntityMock();
			cacheService.get.mockResolvedValue(null);
			userRepository.findUserById.mockResolvedValue(mockUser);

			const result = await service.findUserById('user-id-1');

			expect(result).toEqual(mockUser);
			expect(userRepository.findUserById).toHaveBeenCalledWith('user-id-1');
		});

		it('should save the user to the cache after fetching from the database', async () => {
			const mockUser = createUserEntityMock();
			cacheService.get.mockResolvedValue(null);
			userRepository.findUserById.mockResolvedValue(mockUser);

			await service.findUserById('user-id-1');

			expect(cacheService.set).toHaveBeenCalledWith('user:user-id-1', mockUser);
		});

		it('should throw NotFoundException when the user is not found', async () => {
			cacheService.get.mockResolvedValue(null);
			userRepository.findUserById.mockResolvedValue(null);

			await expect(service.findUserById('user-id-1')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('findUserByCpf', () => {
		it('should return the user when CPF is found', async () => {
			const mockUser = createUserEntityMock();
			userRepository.findUserByCpf.mockResolvedValue(mockUser);

			const result = await service.findUserByCpf('12345678901');

			expect(result).toEqual(mockUser);
		});

		it('should throw NotFoundException when CPF is not found', async () => {
			userRepository.findUserByCpf.mockResolvedValue(null);

			await expect(service.findUserByCpf('12345678901')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should emit a successful log event when the user is found', async () => {
			userRepository.findUserByCpf.mockResolvedValue(createUserEntityMock());

			await service.findUserByCpf('12345678901');

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({ level: LogLevelEnum.Success }),
			);
		});
	});

	describe('deleteUserById', () => {
		it('should successfully delete the user', async () => {
			userRepository.findUserById.mockResolvedValue(createUserEntityMock());
			userRepository.deleteUserById.mockResolvedValue(undefined);

			await expect(service.deleteUserById('user-id-1')).resolves.not.toThrow();
			expect(userRepository.deleteUserById).toHaveBeenCalledWith('user-id-1');
		});

		it('should throw NotFoundException when the user is not found for deletion', async () => {
			userRepository.findUserById.mockResolvedValue(null);

			await expect(service.deleteUserById('user-id-1')).rejects.toThrow(
				NotFoundException,
			);
			expect(userRepository.deleteUserById).not.toHaveBeenCalled();
		});

		it('should emit a successful log event after deleting the user', async () => {
			userRepository.findUserById.mockResolvedValue(createUserEntityMock());
			userRepository.deleteUserById.mockResolvedValue(undefined);

			await service.deleteUserById('user-id-1');

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({ level: LogLevelEnum.Success }),
			);
		});
	});

	describe('updateUserById', () => {
		it('deve atualizar usuário com sucesso', async () => {
			const updatedUser = createUserEntityMock({ firstName: 'Jane' });
			userRepository.findUserByIdAndUpdate.mockResolvedValue(updatedUser);

			const result = await service.updateUserById('user-id-1', {
				firstName: 'Jane',
			});

			expect(result).toEqual(updatedUser);
			expect(userRepository.findUserByIdAndUpdate).toHaveBeenCalledWith(
				'user-id-1',
				{ firstName: 'Jane' },
			);
		});

		it('deve lançar NotFoundException quando usuário não é encontrado para atualizar', async () => {
			userRepository.findUserByIdAndUpdate.mockResolvedValue(null);

			await expect(
				service.updateUserById('user-id-1', { firstName: 'Jane' }),
			).rejects.toThrow(NotFoundException);
		});

		it('deve emitir evento de log de sucesso após atualizar usuário', async () => {
			userRepository.findUserByIdAndUpdate.mockResolvedValue(
				createUserEntityMock(),
			);

			await service.updateUserById('user-id-1', { firstName: 'Jane' });

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({ level: LogLevelEnum.Success }),
			);
		});
	});
});

import { EMAIL_QUEUE } from '@app/shared';
import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';
import { getQueueToken } from '@nestjs/bull';
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import EventEmitter2 from 'eventemitter2';
import { Actor } from '../../auth/interfaces/actor.interface';
import { ClinicRepository } from '../../clinic/repository/clinic.repository';
import {
	createUserEntityMock,
	createUserMock,
	createUserResponseMock,
} from '../../common/factories/user.factory';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { LogEventEnum } from '../../logger/enum/log-event.enum';
import { LogLevelEnum } from '../../logger/enum/log-level.enum';
import { User } from '../entity/users.entity';
import { UserRepository } from '../repository/user.repository';
import { UserDocument } from '../schemas/users.schema';
import { UserService } from '../user.service';

describe('UserService', () => {
	let service: UserService;
	let userRepository: jest.Mocked<UserRepository>;
	let clinicRepository: jest.Mocked<ClinicRepository>;
	let cacheService: jest.Mocked<CacheService>;
	let emailQueue: jest.Mocked<Queue>;
	let eventEmitter: jest.Mocked<EventEmitter2>;

	const actorClinicId = '67ba145c48ea4e5cdf5b5a0f';
	const otherClinicId = '67ba145c48ea4e5cdf5b5a10';

	const createUserDocumentMock = (
		overrides: Partial<User> & { _id?: string } = {},
	): UserDocument => {
		const { _id = 'user-id-1', ...userOverrides } = overrides;
		const user = createUserEntityMock(userOverrides);

		return {
			...user,
			_id: { toString: () => _id },
			toObject: () => ({ ...user, _id }),
		} as unknown as UserDocument;
	};

	const toUserResponse = (user: UserDocument) => ({
		...user.toObject(),
		_id: user._id.toString(),
	});

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

		userRepository.findUserByCpf.mockResolvedValue(null);
		userRepository.findUserByEmail.mockResolvedValue(null);
		userRepository.createUser.mockResolvedValue(createUserDocumentMock());
		emailQueue.add.mockResolvedValue({} as any);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should successfully create a user', async () => {
			const mockUser = createUserDocumentMock();
			userRepository.createUser.mockResolvedValue(mockUser);

			const result = await service.create(createUserMock());

			expect(result).toEqual(toUserResponse(mockUser));
			expect(userRepository.createUser).toHaveBeenCalledTimes(1);
		});

		it('should throw ConflictException when CPF is already registered', async () => {
			userRepository.findUserByCpf.mockResolvedValue(createUserDocumentMock());

			await expect(service.create(createUserMock())).rejects.toThrow(
				ConflictException,
			);
			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('should throw ConflictException when email is already registered', async () => {
			userRepository.findUserByEmail.mockResolvedValue(
				createUserDocumentMock(),
			);

			await expect(service.create(createUserMock())).rejects.toThrow(
				ConflictException,
			);
			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('should reject public registration when isAdmin is true', async () => {
			await expect(
				service.create(createUserMock({ isAdmin: true })),
			).rejects.toThrow(
				new BadRequestException('isAdmin cannot be set on public registration'),
			);

			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('should strip privileged fields from public registration', async () => {
			await service.create(
				createUserMock({
					isAdmin: false,
					clinicId: otherClinicId,
					clinicCnpj: '99.999.999/0001-99',
				}),
			);

			const persistedUser = userRepository.createUser.mock
				.calls[0][0] as User & {
				clinicCnpj?: string;
			};

			expect(persistedUser.isAdmin).not.toBe(true);
			expect(persistedUser.clinicId).toBeUndefined();
			expect(persistedUser.clinicCnpj).toBeUndefined();
		});

		it('should send a welcome email after creating the user', async () => {
			const mockUser = createUserDocumentMock();

			userRepository.findUserByEmail
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(mockUser);

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
			await service.create(createUserMock());

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({
					level: LogLevelEnum.Success,
					message: 'Creating a new user',
				}),
			);
		});

		it('should hash the password before creating the user', async () => {
			await service.create(createUserMock({ password: '123@Test' }));

			const createUserCall = userRepository.createUser.mock.calls[0][0];
			expect(createUserCall.password).not.toBe('123@Test');
			expect(createUserCall.password).toMatch(/^\$2[ab]\$\d+\$/);
		});
	});

	describe('createClinicAdmin', () => {
		it('should reject creation when the actor is not linked to a clinic', async () => {
			const actor: Actor = { id: 'admin-id', isAdmin: true };

			await expect(
				service.createClinicAdmin(createUserMock(), actor),
			).rejects.toThrow(
				new BadRequestException('Administrator is not linked to a clinic'),
			);

			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('should reject creation when the clinic does not exist', async () => {
			clinicRepository.findClinicById.mockResolvedValue(null);

			const actor: Actor = {
				id: 'admin-id',
				isAdmin: true,
				clinicId: actorClinicId,
			};

			await expect(
				service.createClinicAdmin(createUserMock(), actor),
			).rejects.toThrow(new NotFoundException('Clinic not found'));

			expect(clinicRepository.findClinicById).toHaveBeenCalledWith(
				actorClinicId,
			);
			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('should use the actor clinic even when the body sends another clinic', async () => {
			clinicRepository.findClinicById.mockResolvedValue({
				_id: { toString: () => actorClinicId },
			} as any);

			const actor: Actor = {
				id: 'admin-id',
				isAdmin: true,
				clinicId: actorClinicId,
			};

			await service.createClinicAdmin(
				createUserMock({
					isAdmin: false,
					clinicId: otherClinicId,
					clinicCnpj: '99.999.999/0001-99',
				}),
				actor,
			);

			const persistedUser = userRepository.createUser.mock
				.calls[0][0] as User & {
				clinicCnpj?: string;
			};

			expect(clinicRepository.findClinicById).toHaveBeenCalledWith(
				actorClinicId,
			);
			expect(persistedUser.isAdmin).toBe(true);
			expect(persistedUser.clinicId).toBe(actorClinicId);
			expect(persistedUser.clinicCnpj).toBeUndefined();
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
			const mockUser = createUserDocumentMock();
			cacheService.get.mockResolvedValue(null);
			userRepository.findUserById.mockResolvedValue(mockUser);

			const result = await service.findUserById('user-id-1');

			expect(result).toEqual(toUserResponse(mockUser));
			expect(userRepository.findUserById).toHaveBeenCalledWith('user-id-1');
		});

		it('should save the user to the cache after fetching from the database', async () => {
			const mockUser = createUserDocumentMock();
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
			const mockUser = createUserDocumentMock();
			userRepository.findUserByCpf.mockResolvedValue(mockUser);

			const result = await service.findUserByCpf('12345678901');

			expect(result).toEqual(toUserResponse(mockUser));
		});

		it('should throw NotFoundException when CPF is not found', async () => {
			userRepository.findUserByCpf.mockResolvedValue(null);

			await expect(service.findUserByCpf('12345678901')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should emit a successful log event when the user is found', async () => {
			userRepository.findUserByCpf.mockResolvedValue(createUserDocumentMock());

			await service.findUserByCpf('12345678901');

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({ level: LogLevelEnum.Success }),
			);
		});
	});

	describe('deleteUserById', () => {
		it('should successfully delete the user', async () => {
			userRepository.findUserById.mockResolvedValue(createUserDocumentMock());
			userRepository.deleteUserById.mockResolvedValue(undefined);

			await expect(
				service.deleteUserById('user-id-1'),
			).resolves.toBeUndefined();
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
			userRepository.findUserById.mockResolvedValue(createUserDocumentMock());
			userRepository.deleteUserById.mockResolvedValue(undefined);

			await service.deleteUserById('user-id-1');

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({ level: LogLevelEnum.Success }),
			);
		});
	});

	describe('updateUserById', () => {
		it('should successfully update the user', async () => {
			const updatedUser = createUserDocumentMock({ firstName: 'Jane' });
			userRepository.findUserByIdAndUpdate.mockResolvedValue(updatedUser);

			const result = await service.updateUserById('user-id-1', {
				firstName: 'Jane',
			});

			expect(result).toEqual(toUserResponse(updatedUser));
			expect(userRepository.findUserByIdAndUpdate).toHaveBeenCalledWith(
				'user-id-1',
				{ firstName: 'Jane' },
			);
		});

		it('should throw NotFoundException when the user is not found for update', async () => {
			userRepository.findUserByIdAndUpdate.mockResolvedValue(null);

			await expect(
				service.updateUserById('user-id-1', { firstName: 'Jane' }),
			).rejects.toThrow(NotFoundException);
		});

		it('should emit a successful log event after updating the user', async () => {
			userRepository.findUserByIdAndUpdate.mockResolvedValue(
				createUserDocumentMock(),
			);

			await service.updateUserById('user-id-1', { firstName: 'Jane' });

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({ level: LogLevelEnum.Success }),
			);
		});
	});
});

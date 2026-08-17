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
						getCacheValue: jest.fn(),
						cacheValue: jest.fn(),
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
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			emailQueue.add.mockResolvedValue({} as any);
		});

		it('deve criar um usuário com sucesso', async () => {
			const mockUser = createUserEntityMock();
			userRepository.createUser.mockResolvedValue(mockUser);

			const payload = createUserMock();
			const result = await service.create(payload);

			expect(result).toEqual(mockUser);
			expect(userRepository.createUser).toHaveBeenCalledTimes(1);
		});

		it('deve lançar ConflictException quando CPF já está cadastrado', async () => {
			userRepository.findUserByCpf.mockResolvedValue(createUserEntityMock());

			await expect(service.create(createUserEntityMock())).rejects.toThrow(
				ConflictException,
			);
			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('deve lançar ConflictException quando email já está cadastrado', async () => {
			userRepository.findUserByEmail.mockResolvedValue(createUserEntityMock());

			await expect(service.create(createUserEntityMock())).rejects.toThrow(
				ConflictException,
			);
			expect(userRepository.createUser).not.toHaveBeenCalled();
		});

		it('deve lançar BadRequestException quando isAdmin=true e clinicCnpj não é fornecido', async () => {
			await expect(
				service.create(
					createUserEntityMock({ isAdmin: true, clinicId: undefined }),
				),
			).rejects.toThrow(BadRequestException);
		});

		it('deve lançar NotFoundException quando clinicCnpj não encontra uma clínica', async () => {
			clinicRepository.findClinicByCnpj.mockResolvedValue(null);

			await expect(
				service.create(
					createUserMock({ isAdmin: true, clinicCnpj: '12345678000100' }),
				),
			).rejects.toThrow(NotFoundException);
		});

		it('deve associar clinicId ao usuário quando isAdmin=true e clínica é encontrada', async () => {
			const mockClinic = { _id: 'clinic-id-1', cnpj: '12345678000100' };
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			clinicRepository.findClinicByCnpj.mockResolvedValue(mockClinic as any);

			await service.create(
				createUserMock({ isAdmin: true, clinicCnpj: '12345678000100' }),
			);

			expect(userRepository.createUser).toHaveBeenCalledWith(
				expect.objectContaining({ clinicId: 'clinic-id-1' }),
			);
		});

		it('deve enviar email de boas-vindas após criar usuário', async () => {
			await service.create(createUserEntityMock());

			expect(emailQueue.add).toHaveBeenCalledWith(
				'send-email',
				expect.objectContaining({
					to: 'johndoe@test.com',
					metadata: { emailType: EmailTypeEnum.WELCOME },
				}),
			);
		});

		it('deve emitir evento de log de sucesso após criar usuário', async () => {
			await service.create(createUserEntityMock());

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({
					level: LogLevelEnum.Success,
					message: 'Creating a new user',
				}),
			);
		});

		it('deve hashear a senha antes de criar o usuário', async () => {
			const payload = createUserEntityMock({ password: '123@Test' });
			await service.create(payload);

			const createUserCall = userRepository.createUser.mock.calls[0][0];
			expect(createUserCall.password).not.toBe('123@Test');
			expect(createUserCall.password).toMatch(/^\$2[ab]\$\d+\$/);
		});
	});

	describe('findUserById', () => {
		it('deve retornar usuário do cache quando disponível', async () => {
			const mockUser = createUserResponseMock();
			cacheService.getCacheValue.mockResolvedValue(mockUser);

			const result = await service.findUserById('user-id-1');

			expect(result).toEqual(mockUser);
			expect(userRepository.findUserById).not.toHaveBeenCalled();
		});

		it('deve buscar usuário no banco quando não está em cache', async () => {
			const mockUser = createUserEntityMock();
			cacheService.getCacheValue.mockResolvedValue(null);
			userRepository.findUserById.mockResolvedValue(mockUser);

			const result = await service.findUserById('user-id-1');

			expect(result).toEqual(mockUser);
			expect(userRepository.findUserById).toHaveBeenCalledWith('user-id-1');
		});

		it('deve salvar usuário no cache após buscar no banco', async () => {
			const mockUser = createUserEntityMock();
			cacheService.getCacheValue.mockResolvedValue(null);
			userRepository.findUserById.mockResolvedValue(mockUser);

			await service.findUserById('user-id-1');

			expect(cacheService.cacheValue).toHaveBeenCalledWith(
				'user:user-id-1',
				mockUser,
			);
		});

		it('deve lançar NotFoundException quando usuário não é encontrado', async () => {
			cacheService.getCacheValue.mockResolvedValue(null);
			userRepository.findUserById.mockResolvedValue(null);

			await expect(service.findUserById('user-id-1')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('findUserByCpf', () => {
		it('deve retornar usuário quando CPF é encontrado', async () => {
			const mockUser = createUserEntityMock();
			userRepository.findUserByCpf.mockResolvedValue(mockUser);

			const result = await service.findUserByCpf('12345678901');

			expect(result).toEqual(mockUser);
		});

		it('deve lançar NotFoundException quando CPF não é encontrado', async () => {
			userRepository.findUserByCpf.mockResolvedValue(null);

			await expect(service.findUserByCpf('12345678901')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('deve emitir evento de log de sucesso quando usuário é encontrado', async () => {
			userRepository.findUserByCpf.mockResolvedValue(createUserEntityMock());

			await service.findUserByCpf('12345678901');

			expect(eventEmitter.emit).toHaveBeenCalledWith(
				LogEventEnum.InternalLog,
				expect.objectContaining({ level: LogLevelEnum.Success }),
			);
		});
	});

	describe('deleteUserById', () => {
		it('deve deletar usuário com sucesso', async () => {
			userRepository.findUserById.mockResolvedValue(createUserEntityMock());
			userRepository.deleteUserById.mockResolvedValue(undefined);

			await expect(service.deleteUserById('user-id-1')).resolves.not.toThrow();
			expect(userRepository.deleteUserById).toHaveBeenCalledWith('user-id-1');
		});

		it('deve lançar NotFoundException quando usuário não é encontrado para deletar', async () => {
			userRepository.findUserById.mockResolvedValue(null);

			await expect(service.deleteUserById('user-id-1')).rejects.toThrow(
				NotFoundException,
			);
			expect(userRepository.deleteUserById).not.toHaveBeenCalled();
		});

		it('deve emitir evento de log de sucesso após deletar usuário', async () => {
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

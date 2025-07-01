import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { UserCreateDto } from './dto/userCreateDto';
import { UserResponseDto } from './dto/userResponseDto';
import bcrypt from 'bcrypt';
import { UserRepository } from './repository/user.repository';
import { removeNonNumeric } from '../common/helpers/cleaners.helper';
import { CacheService } from '../infrastructure/cache/cache.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EMAIL_QUEUE } from '@app/shared';
import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';
import templates from '../common/templates/email.templates.json';
import EventEmitter2 from 'eventemitter2';
import { LogEventEnum } from '../logger/enum/log-event.enum';
import { LogLevelEnum } from '../logger/enum/log-level.enum';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
		private eventEmitter: EventEmitter2,
		private readonly userRepository: UserRepository,
		private readonly cacheService?: CacheService,
	) {}

	public async newUser(
		userPayload: UserCreateDto,
	): Promise<Partial<UserResponseDto>> {
		const { cpf, email }: { cpf: string; email: string } = userPayload;

		const formattedCpf = removeNonNumeric(cpf);

		const userExistsByCpf =
			await this.userRepository.findUserByCpf(formattedCpf);

		if (userExistsByCpf) {
			this._logger.error(`User with CPF: ${cpf} already registered`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'CPF already registered',
				contexto: 'UserService',
				data: {
					cpf: userPayload.cpf,
				},
			});

			throw new ConflictException('CPF already registered in the system');
		}

		const userExistsByEmail = await this.userRepository.findUserByEmail(email);

		if (userExistsByEmail) {
			this._logger.error(`User with email: ${email} not found`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Email already registered',
				contexto: 'UserService',
				data: {
					email: userPayload.email,
				},
			});

			throw new ConflictException('Email already registered in the system');
		}

		const hashPassword = await this.saltAndHashPassword(userPayload.password);

		const user = { ...userPayload, password: hashPassword };

		const newUser = await this.userRepository.createUser(user);

		await this.sendWelcomeEmailToUser(newUser.email, newUser.firstName);

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Creating a new user',
			context: 'UserService',
			data: {
				name: userPayload.firstName,
				lastName: userPayload.lastName,
				email: userPayload.email,
				cpf: userPayload.cpf,
			},
		});

		return newUser;
	}

	public async findUserById(id: string): Promise<Partial<UserResponseDto>> {
		const cacheKey = `user:${id}`;

		let getUserById = await this.cacheService.getCacheValue(cacheKey);

		if (!getUserById) {
			getUserById = await this.userRepository.findUserById(id);

			if (!getUserById) {
				this._logger.error(`User with ID: ${id} not found`);
				throw new NotFoundException('User not found by id');
			}

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Finding user by id',
				context: 'UserService',
				data: {
					id: id,
				},
			});

			await this.cacheService.cacheValue(cacheKey, getUserById);
		}

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Finding user by id',
			context: 'UserService',
			data: {
				id: id,
			},
		});

		return getUserById;
	}

	public async findUserByCpf(cpf: string): Promise<Partial<UserResponseDto>> {
		const user = await this.userRepository.findUserByCpf(cpf);

		if (!user) {
			this._logger.error(`User with CPF: ${cpf} not found`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Finding user by cpf',
				context: 'UserService',
				data: {
					cpf: cpf,
				},
			});

			throw new NotFoundException('User not found by CPF');
		}

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Finding a user by cpf',
			context: 'UserService',
			data: {
				cpf: cpf,
			},
		});

		return user;
	}

	public async deleteUserById(id: string): Promise<void> {
		const user = await this.userRepository.findUserById(id);

		if (!user) {
			this._logger.error(`User with ID: ${id} not found to delete`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Deleting user by id',
				context: 'UserService',
				data: {
					id: id,
				},
			});

			throw new NotFoundException('User not found to delete');
		}

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Deleting user by cpf',
			context: 'UserService',
			data: {
				id: id,
			},
		});

		await this.userRepository.deleteUserById(id);
	}

	public async updateUserById(
		id: string,
		newUserData: object,
	): Promise<Partial<UserResponseDto>> {
		const findUserAndUpdate = await this.userRepository.findUserByIdAndUpdate(
			id,
			newUserData,
		);

		if (!findUserAndUpdate) {
			this._logger.error(`User with ID: ${id} not found to update`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Updating user by id',
				context: 'UserService',
				data: {
					id: id,
				},
			});

			throw new NotFoundException('User not found to update');
		}

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Updating user by id',
			context: 'UserService',
			data: {
				id: id,
				body: newUserData,
			},
		});

		return findUserAndUpdate;
	}

	private async sendWelcomeEmailToUser(
		userEmail: string,
		firstName: string,
	): Promise<void> {
		const templateEmail = templates.welcome;

		const emailData = {
			to: userEmail,
			subject: templateEmail.subject.replace('{{firstName}}', firstName),
			body: templateEmail.body,
		};

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Info,
			message: 'Sending welcome email to new user',
			context: 'UserService',
			data: {
				email: userEmail,
				name: firstName,
			},
		});

		await this.emailQueue.add('send-email', {
			to: emailData.to,
			subject: emailData.subject,
			body: emailData.body,
			metadata: {
				emailType: EmailTypeEnum.WELCOME,
			},
		});
	}

	private async saltAndHashPassword(userPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);
		const hashPassword: string = await bcrypt.hash(userPassword, salt);

		return hashPassword;
	}
}

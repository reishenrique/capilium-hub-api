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

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
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
			throw new ConflictException('CPF already registered in the system');
		}

		const userExistsByEmail = await this.userRepository.findUserByEmail(email);

		if (userExistsByEmail) {
			this._logger.error(`User with Email: ${email} not found`);
			throw new ConflictException('Email already registered in the system');
		}

		const hashPassword = await this.saltAndHashPassword(userPayload.password);

		const user = { ...userPayload, password: hashPassword };

		const newUser = await this.userRepository.createUser(user);

		await this.sendWelcomeEmailToUser(newUser.email, newUser.firstName);

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

			await this.cacheService.cacheValue(cacheKey, getUserById);
		}

		return getUserById;
	}

	public async findUserByCpf(cpf: string): Promise<Partial<UserResponseDto>> {
		const user = await this.userRepository.findUserByCpf(cpf);

		if (!user) {
			this._logger.error(`User with CPF: ${cpf} not found`);
			throw new NotFoundException('User not found by CPF');
		}

		return user;
	}

	public async deleteUserById(id: string): Promise<void> {
		const user = await this.userRepository.findUserById(id);

		if (!user) {
			this._logger.error(`User with ID: ${id} not found to delete`);
			throw new NotFoundException('User not found to delete');
		}

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
			throw new NotFoundException('User not found to update');
		}

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

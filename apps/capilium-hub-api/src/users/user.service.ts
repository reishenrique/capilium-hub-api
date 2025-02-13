import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';
import { UserResponseDto } from './dto/responseUserDto';
import bcrypt from 'bcrypt';
import { UserRepository } from './repository/user.repository';
import { removeNonNumeric } from '../common/helpers/cleanersHelper';
import { CacheService } from '../infrastructure/cache/cache.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EMAIL_QUEUE } from '@app/shared';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
		private readonly userRepository: UserRepository,
		private readonly cacheService?: CacheService,
	) {}

	public async newUser(
		userPayload: CreateUserDto,
	): Promise<Partial<UserResponseDto>> {
		const { cpf, email }: { cpf: string; email: string } = userPayload;

		const formattedCpf = removeNonNumeric(cpf);

		const userExistsByCpf =
			await this.userRepository.findUserByCpf(formattedCpf);

		if (userExistsByCpf)
			throw new ConflictException('CPF already registered in the system');

		const userExistsByEmail = await this.userRepository.findUserByEmail(email);

		if (userExistsByEmail)
			throw new ConflictException('Email already registered in the system');

		const saltRounds = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(userPayload.password, saltRounds);

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
				throw new NotFoundException('User not found by id');
			}

			await this.cacheService.cacheValue(cacheKey, getUserById);
		}

		return getUserById;
	}

	public async findUserByCpf(cpf: string): Promise<Partial<UserResponseDto>> {
		const user = await this.userRepository.findUserByCpf(cpf);

		if (!user) {
			throw new NotFoundException('User not found by CPF');
		}

		return user;
	}

	public async deleteUserById(id: string): Promise<void> {
		const user = await this.userRepository.findUserById(id);

		if (!user) {
			throw new NotFoundException('User not found to delete');
		}

		await this.userRepository.deleteUserById(id);
	}

	public async upgradeUserById(
		id: string,
		newUserData: object,
	): Promise<Partial<UserResponseDto>> {
		const findUserAndUpdate = await this.userRepository.findUserByIdAndUpdate(
			id,
			newUserData,
		);

		if (!findUserAndUpdate) {
			throw new NotFoundException('User not found to update');
		}

		return findUserAndUpdate;
	}

	private async sendWelcomeEmailToUser(
		userEmail: string,
		firstName: string,
	): Promise<void> {
		const emailData = {
			to: userEmail,
			subject: `Welcome ${firstName}!`,
			body: "We're happy to have you here. ",
		};

		await this.emailQueue.add('send-email', {
			to: emailData.to,
			subject: emailData.subject,
			body: emailData.body,
		});
	}
}

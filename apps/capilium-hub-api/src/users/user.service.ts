import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
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
import { send } from '../common/utils/mailerUtils';
import { EMAIL_QUEUE } from '@app/shared';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(
		@InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
		private readonly userRepository: UserRepository,
		private readonly cacheService?: CacheService,
	) {}

	async newUser(userPayload: CreateUserDto): Promise<Partial<UserResponseDto>> {
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

		const emailData = {
			subject: `Welcome ${newUser.firstName}!`,
			body: "We're happy to have you here. ",
		};

		await send(user.email, emailData.subject, emailData.body);

		return newUser;
	}

	async findUserById(id: string): Promise<Partial<UserResponseDto>> {
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

	async findUserByCpf(cpf: string): Promise<Partial<UserResponseDto>> {
		const user = await this.userRepository.findUserByCpf(cpf);

		if (!user) {
			throw new NotFoundException('User not found by CPF');
		}

		return user;
	}

	async deleteUserById(id: string): Promise<void> {
		const user = await this.userRepository.findUserById(id);

		if (!user) {
			throw new NotFoundException('User not found to delete');
		}

		await this.userRepository.deleteUserById(id);
	}

	async upgradeUserById(
		id: string,
		newUserData: object,
	): Promise<Partial<UserResponseDto>> {
		const findUserAndUpdate = await this.userRepository.findUserByIdAndUpdate(
			id,
			newUserData,
		);

		if (!findUserAndUpdate) {
			throw new NotFoundException('User not found for update');
		}

		return findUserAndUpdate;
	}
}

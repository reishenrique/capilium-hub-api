import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/createUserDto';
import { ResponseUserDto } from '../dto/responseUserDto';
import { removeNonNumeric } from 'src/helpers/cleaners';
import bcrypt from 'bcrypt';
import { IUserRepository } from '../interfaces/IUserRepository';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(private readonly userRepository: IUserRepository) {}

	async newUser(userPayload: CreateUserDto): Promise<Partial<ResponseUserDto>> {
		const { cpf, email }: { cpf: string; email: string } = userPayload;

		const formattedCpf = removeNonNumeric(cpf);

		const userExistsByCpf =
			await this.userRepository.getUserByCpf(formattedCpf);

		if (userExistsByCpf)
			throw new ConflictException('CPF already registered in the system');

		const userExistsByEmail = await this.userRepository.getUserByEmail(email);

		if (userExistsByEmail)
			throw new ConflictException('Email already registered in the system');

		const saltRounds = await bcrypt.genSalt(10);
		const hashPassword = await bcrypt.hash(userPayload.password, saltRounds);

		const user = { ...userPayload, password: hashPassword };

		const newUser = await this.userRepository.createUser(user);

		return newUser;
	}

	async getUserById(id: string): Promise<Partial<ResponseUserDto>> {
		const user = await this.userRepository.getUserById(id);

		if (!user) {
			throw new NotFoundException('User not found by id');
		}

		return user;
	}

	async getUserByCpf(cpf: string): Promise<Partial<ResponseUserDto>> {
		const user = await this.userRepository.getUserByCpf(cpf);

		if (!user) {
			throw new NotFoundException('User not found by CPF');
		}

		return user;
	}

	async deleteUserById(id: string): Promise<void> {
		const user = await this.userRepository.getUserById(id);

		if (!user) {
			throw new NotFoundException('User not found to delete');
		}

		await this.userRepository.deleteUserById(id);
	}

	async upgradeUserById(
		id: string,
		newUserData: object,
	): Promise<Partial<ResponseUserDto>> {
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

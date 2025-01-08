import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { CreateUserDto } from '../dto/createUserDto';
import { ResponseUserDto } from '../dto/responseUserDto';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(private readonly userRepository: UserRepository) {}

	async newUser(user: CreateUserDto): Promise<Partial<ResponseUserDto>> {
		const { cpf, email }: { cpf: string; email: string} = user;

		const userExistsByCpf = await this.userRepository.getUserByCpf(cpf);

		if (userExistsByCpf) throw new ConflictException('CPF already registered in the system');
		
		const userExistsByEmail = await this.userRepository.getUserByEmail(email)

		if (userExistsByEmail) throw new ConflictException('Email already registered in the system')

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

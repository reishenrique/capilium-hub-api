import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { CreateUserDto } from '../dto/createUserDto';
import { ResponseUserDto } from '../dto/responseUserDto';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(private readonly userRepository: UserRepository) {}

	async newUser(
		user: CreateUserDto,
	): Promise<Partial<ResponseUserDto>> {
		const { cpf }: { cpf: string } = user
	
		const userExistsByCpf = await this.userRepository.getUserByCpf(cpf)

		if (userExistsByCpf) {
			throw new ConflictException('CPF already registered in the system')
		}

		const newUser = await this.userRepository.createUser(user);

		return newUser;
	}

	async getUserById(id: string): Promise<Partial<ResponseUserDto>> {
		const user = await this.userRepository.getUserById(id)

		if (!user) {	
			throw new NotFoundException('User not found')
		}

		return user
	}
}

import { Injectable, Logger } from '@nestjs/common';
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
		const newUser = await this.userRepository.createUser(user);
		return newUser;
	}
}

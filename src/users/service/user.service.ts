import { Injectable, Logger } from '@nestjs/common';
import type { UserRepository } from '../repository/user.repository';
import type { UserEntity } from '../entity/users.entity';
import type { UserDTO } from '../dto/user.dto';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(private readonly userRepository: UserRepository) {}

	async newUser(user: UserDTO): Promise<UserEntity> {
		const newUser = await this.userRepository.createUser(user);
		return newUser;
	}
}

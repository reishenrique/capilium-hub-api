import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserEntity } from '../entity/users.entity';
import { UserDTO } from '../dto/user.dto';

@Injectable()
export class UserService {
	protected readonly _logger = new Logger('UserService');
	constructor(private readonly userRepository: UserRepository) {}

	async newUser(user: UserDTO): Promise<UserEntity> {
		const newUser = await this.userRepository.createUser(user);
		return newUser;
	}
}

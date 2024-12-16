import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
} from '@nestjs/common';
import type { UserService } from '../service/user.service';
import type { UserDTO } from '../dto/user.dto';
import type { UserEntity } from '../entity/users.entity';

@Controller('user')
export class UserController {
	protected readonly _logger = new Logger(UserController.name);
	constructor(private readonly userService: UserService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	public async create(@Body() user: UserDTO): Promise<UserEntity> {
		try {
			const newUser = await this.userService.newUser(user);

			return newUser;
		} catch (error) {
			this._logger.error('Error when trying to created a new user');
			throw new BadRequestException(error.message);
		}
	}
}

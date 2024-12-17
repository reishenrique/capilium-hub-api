import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/createUserDto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseUserDto } from '../dto/responseUserDto';

@ApiTags('user')
@Controller('user')
export class UserController {
	protected readonly _logger = new Logger(UserController.name);
	constructor(private readonly userService: UserService) {}

	@Post('/create')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({ status: 201, type: ResponseUserDto })
	@ApiResponse({
		status: 400,
		description: 'Error when trying to created a new user',
	})
	public async create(
		@Body() user: CreateUserDto,
	): Promise<Partial<ResponseUserDto>> {
		try {
			const newUser = await this.userService.newUser(user);

			return newUser;
		} catch (error) {
			this._logger.error('Error when trying to created a new user');
			throw new BadRequestException(error.message);
		}
	}
}

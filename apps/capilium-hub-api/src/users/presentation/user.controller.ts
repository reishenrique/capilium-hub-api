import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	Put,
	UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { UserCreateDto } from '../dto/userCreateDto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/userResponseDto';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';

@ApiTags('user')
@Controller('user')
export class UserController {
	protected readonly _logger = new Logger(UserController.name);
	constructor(private readonly userService: UserService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({ status: 201, type: UserResponseDto })
	@ApiResponse({
		status: 409,
		description: 'CPF already registered in the system',
	})
	@ApiResponse({
		status: 409,
		description: 'Email already registered in the system',
	})
	@ApiResponse({
		status: 400,
		description: 'Error when trying to created a new user',
	})
	public async create(
		@Body() user: UserCreateDto,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.create(user);
	}

	@Get('by-id/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting user by id' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	@ApiResponse({ status: 404, description: 'User not found by id' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	@UseInterceptors(LoggingInterceptor)
	public async findUserById(
		@Param('id') id: string,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.findUserById(id);
	}

	@Get('by-cpf/:cpf')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting user by id' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	@ApiResponse({ status: 404, description: 'User not found by CPF' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	@UseInterceptors(LoggingInterceptor)
	public async findUserByCpf(
		@Param('cpf') cpf: string,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.findUserByCpf(cpf);
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete user by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400, description: 'User not found to delete' })
	@ApiResponse({ status: 500, description: 'Internal Server Error ' })
	@UseInterceptors(LoggingInterceptor)
	public async deleteUserById(@Param('id') id: string): Promise<void> {
		return await this.userService.deleteUserById(id);
	}

	@Put('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Upgrade a user by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400, description: 'User not found to update' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	@UseInterceptors(LoggingInterceptor)
	public async updateUserById(
		@Param('id') id: string,
		@Body() newUserData: Partial<UserCreateDto>,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.updateUserById(id, newUserData);
	}
}

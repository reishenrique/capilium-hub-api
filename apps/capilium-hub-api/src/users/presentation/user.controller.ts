import {
	Body,
	ConflictException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/userCreateDto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/userResponseDto';

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
		@Body() user: CreateUserDto,
	): Promise<Partial<UserResponseDto>> {
		try {
			const newUser = await this.userService.newUser(user);

			return newUser;
		} catch (error) {
			if (error instanceof ConflictException || error instanceof Error) {
				throw error;
			}

			this._logger.error('Error when trying to created a new user');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Get('by-id/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting user by id' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	@ApiResponse({ status: 404, description: 'User not found by id' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async findUserById(
		@Param('id') id: string,
	): Promise<Partial<UserResponseDto>> {
		try {
			const user = await this.userService.findUserById(id);

			return user;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			this._logger.error('Error when trying to get a user by id');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Get('by-cpf/:cpf')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting user by id' })
	@ApiResponse({ status: 200, type: UserResponseDto })
	@ApiResponse({ status: 404, description: 'User not found by CPF' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async findUserByCpf(
		@Param('cpf') cpf: string,
	): Promise<Partial<UserResponseDto>> {
		try {
			const user = await this.userService.findUserByCpf(cpf);

			return user;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			this._logger.error('Error when trying to get a user by cpf');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete user by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400, description: 'User not found to delete' })
	@ApiResponse({ status: 500, description: 'Internal Server Error ' })
	public async deleteUserById(@Param('id') id: string): Promise<void> {
		try {
			const user = await this.userService.deleteUserById(id);

			return user;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			this._logger.error('Error trying delete user by id');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Put('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Upgrade a user by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400, description: 'User not found to upgrade' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async upgradeUserById(
		@Param('id') id: string,
		@Body() newUserData: Partial<CreateUserDto>,
	): Promise<Partial<UserResponseDto>> {
		try {
			const upgradeUser = await this.userService.upgradeUserById(
				id,
				newUserData,
			);

			return upgradeUser;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			this._logger.error('Error trying upgrade a user by id');
			throw new InternalServerErrorException(error.message);
		}
	}
}

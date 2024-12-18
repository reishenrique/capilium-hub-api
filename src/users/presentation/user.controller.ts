import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Param,
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
		status: 409,
		description: 'CPF already registered in the system',
	})
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
			if (error instanceof ConflictException) {
				throw error
			}

			this._logger.error('Error when trying to created a new user');
			throw new BadRequestException(error.message);
		}
	}

	@Get('by-id/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting user by id' })
	@ApiResponse({ status: 200, type: ResponseUserDto })
	@ApiResponse({ status: 404, description: 'User not found by id' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async findUserById(@Param('id') id: string): Promise<Partial<ResponseUserDto>> {
		try {
			const user = await this.userService.getUserById(id)

			return user
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error
			}

			this._logger.error('Error when trying to get a user by id')
			throw new InternalServerErrorException(error.message)
		}
	}

	@Get('by-cpf/:cpf')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting user by id' })
	@ApiResponse({ status: 200, type: ResponseUserDto })
	@ApiResponse({ status: 404, description: 'User not found by CPF' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async findUserByCpf(@Param('cpf') cpf: string): Promise<Partial<ResponseUserDto>> {
		try {
			const user = await this.userService.getUserByCpf(cpf)

			return user
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error
			}

			this._logger.error('Error when trying to get a user by cpf')
			throw new InternalServerErrorException(error.message)
		}
	}
}

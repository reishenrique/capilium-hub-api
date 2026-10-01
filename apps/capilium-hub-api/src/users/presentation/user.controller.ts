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
import {
	ApiCreateUserSwaggerDocumentation,
	ApiDeleteUserSwaggerDocumentation,
	ApiGetUserByCpfSwaggerDocumentation,
	ApiGetUserByIdSwaggerDocumetation,
	ApiUpdateUserSwaggerDocumentation,
} from '../swagger/user.swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
	protected readonly _logger = new Logger(UserController.name);
	constructor(private readonly userService: UserService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiCreateUserSwaggerDocumentation()
	public async create(
		@Body() user: UserCreateDto,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.create(user);
	}

	@Get('by-id/:id')
	@HttpCode(HttpStatus.OK)
	@ApiGetUserByIdSwaggerDocumetation()
	@UseInterceptors(LoggingInterceptor)
	public async findUserById(
		@Param('id') id: string,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.findUserById(id);
	}

	@Get('by-cpf/:cpf')
	@HttpCode(HttpStatus.OK)
	@ApiGetUserByCpfSwaggerDocumentation()
	@UseInterceptors(LoggingInterceptor)
	public async findUserByCpf(
		@Param('cpf') cpf: string,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.findUserByCpf(cpf);
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiDeleteUserSwaggerDocumentation()
	@UseInterceptors(LoggingInterceptor)
	public async deleteUserById(@Param('id') id: string): Promise<void> {
		return await this.userService.deleteUserById(id);
	}

	@Put('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiUpdateUserSwaggerDocumentation()
	@UseInterceptors(LoggingInterceptor)
	public async updateUserById(
		@Param('id') id: string,
		@Body() newUserData: Partial<UserCreateDto>,
	): Promise<Partial<UserResponseDto>> {
		return await this.userService.updateUserById(id, newUserData);
	}
}

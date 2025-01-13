import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	Post,
	UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/loginDto';
import { LoginResponseDto } from '../dto/loginResponseDto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	protected readonly _logger = new Logger(AuthController.name);
	constructor(private readonly authService: AuthService) {}

	@Post('/login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Logging a user' })
	@ApiResponse({ status: 201, description: 'Login successful!' })
	@ApiResponse({ status: 401, description: 'Unauthorized or Invalid password' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async login(@Body() loginData: LoginDto): Promise<LoginResponseDto> {
		try {
			const loginAndGenerateAccessToken =
				await this.authService.login(loginData);

			return loginAndGenerateAccessToken;
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}

			this._logger.error('Error when trying to log in user');
			throw new InternalServerErrorException(error.message);
		}
	}
}

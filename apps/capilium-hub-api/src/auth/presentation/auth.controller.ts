import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Post,
	UnauthorizedException,
	UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/loginDto';
import { LoginResponseDto } from '../dto/loginResponseDto';
import { RefreshAuthCredentialsDto } from '../dto/refreshAuthCredentialsDto';
import { RefreshAuthResponseDto } from '../dto/refreshAuthResponseDto';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	protected readonly _logger = new Logger(AuthController.name);
	constructor(private readonly authService: AuthService) {}

	@Post('/login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Logging a user' })
	@ApiResponse({ status: 201, description: 'Login successful!' })
	@ApiResponse({
		status: 401,
		description: 'Unauthorized or Invalid password',
	})
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	@UseInterceptors(LoggingInterceptor)
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

	@Post('/refreshAccessToken')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Refresh user access token' })
	@ApiResponse({
		status: 201,
		description: 'Access token updated successfully',
	})
	@ApiResponse({
		status: 400,
		description:
			'User email and refresh token is required to proceed with refresh',
	})
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	@UseInterceptors(LoggingInterceptor)
	public async refreshAccessToken(
		@Body() refreshAuthCredentials: RefreshAuthCredentialsDto,
	): Promise<RefreshAuthResponseDto> {
		try {
			const refreshUserToken = await this.authService.refreshToken(
				refreshAuthCredentials,
			);

			return refreshUserToken;
		} catch (error) {
			if (error instanceof BadRequestException || NotFoundException) {
				throw error;
			}

			this._logger.error('Error when trying to generate new user token');
			throw new InternalServerErrorException(error.message);
		}
	}
}

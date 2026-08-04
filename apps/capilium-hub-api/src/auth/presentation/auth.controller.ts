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
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/loginDto';
import { LoginResponseDto } from '../dto/loginResponseDto';
import { RefreshAuthCredentialsDto } from '../dto/refreshAuthCredentialsDto';
import { RefreshAuthResponseDto } from '../dto/refreshAuthResponseDto';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import { ApiAuthLogin, ApiAuthRefreshToken } from '../swagger/auth.swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	protected readonly _logger = new Logger(AuthController.name);
	constructor(private readonly authService: AuthService) {}

	@Post('/login')
	@HttpCode(HttpStatus.OK)
	@ApiAuthLogin()
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
			throw new InternalServerErrorException(error);
		}
	}

	@Post('/refreshAccessToken')
	@HttpCode(HttpStatus.OK)
	@ApiAuthRefreshToken()
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
			throw new InternalServerErrorException(error);
		}
	}
}

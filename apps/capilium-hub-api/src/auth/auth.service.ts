import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { RefreshAuthCredentialsDto } from './dto/refreshAuthCredentialsDto';
import { RefreshAuthResponseDto } from './dto/refreshAuthResponseDto';
import { LoginDto } from './dto/loginDto';
import bcrypt from 'bcrypt';
import { LoginResponseDto } from './dto/loginResponseDto';
import {
	generateAccessToken,
	refreshAccessToken,
} from '../common/helpers/jwt.helper';
import { UserRepository } from '../users/repository/user.repository';
import { LogEventEnum } from '../logger/enum/log-event.enum';
import EventEmitter2 from 'eventemitter2';
import { LogLevelEnum } from '../logger/enum/log-level.enum';

@Injectable()
export class AuthService {
	protected readonly _logger = new Logger('AuthService');
	private eventEmitter: EventEmitter2;
	constructor(private readonly userRepository: UserRepository) {}

	async login(login: LoginDto): Promise<LoginResponseDto> {
		const user = await this.userRepository.findUserByEmail(login.email);

		if (!user) {
			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'User not found',
				context: 'AuthService',
				data: {
					email: login.email,
				},
			});

			throw new UnauthorizedException('Unauthorized');
		}

		const isValidPassword = await bcrypt.compareSync(
			login.password,
			user.password,
		);

		if (!isValidPassword) {
			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Invalid password',
				context: 'AuthService',
				data: {
					email: login.email,
				},
			});

			throw new UnauthorizedException('Invalid password');
		}

		const token = generateAccessToken(user);

		return {
			message: 'Login successful!',
			token,
		};
	}

	async refreshToken(
		refreshAuthCredentials: RefreshAuthCredentialsDto,
	): Promise<RefreshAuthResponseDto> {
		if (!refreshAuthCredentials.email || !refreshAuthCredentials.refreshToken) {
			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'User email and refresh token is required',
				context: 'AuthService',
				data: {
					email: refreshAuthCredentials.email,
					refreshToken: refreshAuthCredentials.refreshToken,
				},
			});

			throw new BadRequestException(
				'User email and refresh token is required to proceed with refresh',
			);
		}

		const user = await this.userRepository.findUserByEmail(
			refreshAuthCredentials.email,
		);

		if (!user) throw new NotFoundException('User not found');

		const token = refreshAccessToken(
			refreshAuthCredentials.refreshToken,
			refreshAuthCredentials.email,
		);

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Access token updated',
			context: 'AuthService',
			data: {
				email: refreshAuthCredentials.email,
			},
		});

		return {
			message: 'Access token updated successfully',
			token,
		};
	}
}

import {
	BadRequestException,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/users/repository/user.repository';
import { RefreshAuthCredentialsDto } from '../dto/refreshAuthCredentialsDto';
import { RefreshAuthResponseDto } from '../dto/refreshAuthResponseDto';
import { LoginDto } from '../dto/loginDto';
import {
	generateAccessToken,
	refreshAccessToken,
} from 'src/common/helpers/jwtHelper';
import bcrypt from 'bcrypt';
import { LoginResponseDto } from '../dto/loginResponseDto';

export class AuthService {
	protected readonly _logger = new Logger('AuthService');
	constructor(private readonly userRepository: UserRepository) {}

	async login(login: LoginDto): Promise<LoginResponseDto> {
		const user = await this.userRepository.findUserByEmail(login.email);

		if (!user) throw new UnauthorizedException('Unauthorized');

		const isValidPassword = await bcrypt.compareSync(
			login.password,
			user.password,
		);

		if (!isValidPassword) throw new UnauthorizedException('Invalid password');

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

		return {
			message: 'Access token updated successfully',
			token,
		};
	}
}

import { Logger, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/users/repository/user.repository';
import { LoginDto } from '../dto/loginDto';
import { generateAccessToken } from 'src/helpers/jwt';
import bcrypt from 'bcrypt';

export class AuthService {
	protected readonly _logger = new Logger('AuthService');
	constructor(private readonly userRepository: UserRepository) {}

	async login(login: LoginDto): Promise<{ message: string; token: string}> {
		const user = await this.userRepository.getUserByEmail(login.email);

		if (!user) throw new UnauthorizedException('Unauthorized');

		const isValidPassword = await bcrypt.compareSync(
			login.password,
			user.password,
		);

		if (!isValidPassword) throw new UnauthorizedException('Invalid password');

        const token = generateAccessToken(user);

        return {
            message: 'Login successful!',
            token
        }
	}
}

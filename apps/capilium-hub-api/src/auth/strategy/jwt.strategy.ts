import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../users/repository/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly userRepository: UserRepository) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.SECRET,
		});
	}

	async validate(payload: JwtPayload) {
		if (!payload?.id) {
			throw new UnauthorizedException('Invalid token payload');
		}

		const user = await this.userRepository.findUserById(payload.id);

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		return {
			id: user._id.toString(),
			email: user.email,
			isAdmin: Boolean(user.isAdmin),
			clinicId: user.clinicId,
		};
	}
}

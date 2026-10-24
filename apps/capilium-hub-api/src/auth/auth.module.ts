import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { JwtAuthGuard } from './guard/jwt.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [
		PassportModule,
		UserModule,
		JwtModule.register({
			secret: process.env.SECRET,
			signOptions: { expiresIn: '60m' },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}

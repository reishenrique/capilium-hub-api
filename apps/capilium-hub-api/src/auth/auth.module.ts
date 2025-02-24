import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';

@Module({
	imports: [
		UserModule,
		JwtModule.register({
			secret: process.env.SECRET,
			signOptions: { expiresIn: '60m' },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RefreshAuthCredentialsDto {
	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		description: 'Refresh token',
	})
	@IsNotEmpty({ message: 'The refresh token is required' })
	@IsString({ message: 'The refresh token must be a string' })
	refreshToken: string;

	@ApiProperty({
		example: 'johndoe@test.com',
		description: 'User email',
	})
	@IsNotEmpty({ message: 'The user email is required' })
	@IsEmail({}, { message: 'The user email must be a valid email' })
	email: string;
}

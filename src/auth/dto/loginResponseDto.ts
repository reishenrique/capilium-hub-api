import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
	@ApiProperty({
		example: 'Login successful!',
		description: 'Message indicating successful login',
	})
	message: string;

	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		description: 'Authentication user token',
	})
	token: string;
}

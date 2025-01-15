import { ApiProperty } from '@nestjs/swagger';

class LoginResponse {
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

export type LoginResponseDto = Omit<LoginResponse, never>;

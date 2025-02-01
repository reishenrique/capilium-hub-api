import { ApiProperty } from '@nestjs/swagger';

export class RefreshAuthCredentialsDto {
	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		description: 'Refresh token',
	})
	refreshToken: string;

	@ApiProperty({
		example: 'johndoe@test.com',
		description: 'User email',
	})
	email: string;
}

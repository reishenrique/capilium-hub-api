import { ApiProperty } from '@nestjs/swagger';

class RefreshAuthResponse {
	@ApiProperty({
		example: 'Access token updated successfully',
		description: 'Message indicating user token update',
	})
	message: string;

	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
		description: 'New token',
	})
	token: string;
}

export type RefreshAuthResponseDto = Omit<RefreshAuthResponse, never>;

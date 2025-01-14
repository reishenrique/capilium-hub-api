import { ApiProperty } from '@nestjs/swagger';

export class RefreshAuthResponseDto {
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

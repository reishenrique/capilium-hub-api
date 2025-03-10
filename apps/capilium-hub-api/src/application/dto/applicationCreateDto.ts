import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApplicationCreateDto {
	@ApiProperty({
		example: '65848d10e8fe8de615fd2cfd',
		description: 'Opportunity ID',
		type: String,
	})
	@IsNotEmpty({ message: 'The "opportunity" id is required' })
	@IsString({ message: 'The "opportunityId" field must be a string' })
	opportunityId: string;

	@ApiProperty({
		example: '65848d10e8fe8de615fd2cfd',
		description: 'User ID',
		type: String,
	})
	@IsNotEmpty({ message: 'The "appliedUser" id is required' })
	@IsString({ message: 'The "appliedUserId" field must be a string' })
	appliedUserId: string;
}

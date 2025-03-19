import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ApplicationCreateDto {
	@ApiProperty({
		example: '65848d10e8fe8de615fd2cfd',
		description: 'Opportunity ID',
		type: String,
	})
	@IsNotEmpty()
	@IsString({ message: 'This field is a object id' })
	opportunityId: string;

	@ApiProperty({
		example: '65848d10e8fe8de615fd2cfd',
		description: 'User ID',
		type: String,
	})
	@IsNotEmpty()
	@IsString({ message: 'This field is a object id' })
	userId: string;
}

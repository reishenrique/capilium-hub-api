import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class OpportunityCreateDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	description: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	location: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	salary: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsEnum(StatusEnum)
	status: StatusEnum;
}

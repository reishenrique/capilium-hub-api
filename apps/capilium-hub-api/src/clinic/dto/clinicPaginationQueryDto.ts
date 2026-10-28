import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ClinicPaginationQueryDto {
	@ApiPropertyOptional({
		example: 1,
		description: 'Page number (starts at 1)',
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'The "page" query param must be an integer' })
	@Min(1, { message: 'The "page" query param must be greater than zero' })
	page = 1;

	@ApiPropertyOptional({
		example: 10,
		description: 'Number of clinics per page',
		default: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: 'The "limit" query param must be an integer' })
	@Min(1, { message: 'The "limit" query param must be greater than zero' })
	limit = 10;
}

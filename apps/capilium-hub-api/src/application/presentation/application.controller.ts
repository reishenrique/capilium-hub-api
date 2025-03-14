import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
} from '@nestjs/common';
import { ApplicationService } from '../application.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApplicationCreateDto } from '../dto/applicationCreateDto';
import { ApplicationResponseDto } from '../dto/applicationResponseDto';

@ApiTags('application')
@Controller('application')
export class ApplicationController {
	protected readonly _logger = new Logger(ApplicationController.name);
	constructor(private readonly applicationService: ApplicationService) {}

	@Post(':opportunityId/apply')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Creates registry of user application for opportunity',
	})
	@ApiResponse({ status: 201 })
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({
		status: 409,
		description: 'User has already applied for this opportunity',
	})
	public async apply(
		@Param() opportunityId: string,
		@Body() applicationPayload: ApplicationCreateDto,
	): Promise<ApplicationResponseDto> {
		console.log('Recebido no controller: ', applicationPayload);
		return await this.applicationService.createApplication({
			opportunityId,
			userId: applicationPayload.userId,
		});
	}
}

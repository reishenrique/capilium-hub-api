import {
	Body,
	Controller,
	Delete,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from '../application.service';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationCreateDto } from '../dto/applicationCreateDto';
import { ApplicationResponseDto } from '../dto/applicationResponseDto';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import {
	ApiApplyApplication,
	ApiDeleteApplication,
} from '../swagger/application.swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';

@ApiTags('application')
@Controller('application')
export class ApplicationController {
	protected readonly _logger = new Logger(ApplicationController.name);
	constructor(private readonly applicationService: ApplicationService) {}

	@Post(':opportunityId/apply')
	@HttpCode(HttpStatus.CREATED)
	@ApiApplyApplication()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async apply(
		@Param('opportunityId') opportunityId: string,
		@Body() applicationPayload: ApplicationCreateDto,
	): Promise<ApplicationResponseDto> {
		return await this.applicationService.apply({
			opportunityId,
			userId: applicationPayload.userId,
		});
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiDeleteApplication()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async deleteApplicationById(@Param('id') id: string): Promise<void> {
		return await this.applicationService.deleteApplicationById(id);
	}
}

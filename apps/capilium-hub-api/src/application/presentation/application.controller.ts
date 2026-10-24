import {
	Controller,
	Delete,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	Req,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from '../application.service';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationResponseDto } from '../dto/applicationResponseDto';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import {
	ApiApplyApplication,
	ApiDeleteApplication,
} from '../swagger/application.swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { AuthenticatedRequest } from '../../auth/interfaces/IAuthenticatedRequest';
import { ApplicationOwnerOrAdminGuard } from '../guard/application-owner-or-admin.guard';

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
		@Req() request: AuthenticatedRequest,
	): Promise<ApplicationResponseDto> {
		return await this.applicationService.apply({
			opportunityId,
			userId: request.user.id,
		});
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiDeleteApplication()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard, ApplicationOwnerOrAdminGuard)
	public async deleteApplicationById(@Param('id') id: string): Promise<void> {
		return await this.applicationService.deleteApplicationById(id);
	}
}

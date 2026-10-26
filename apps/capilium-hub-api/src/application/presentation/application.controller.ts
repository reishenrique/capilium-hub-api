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
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import { ApplicationService } from '../application.service';
import { ApplicationResponseDto } from '../dto/applicationResponseDto';
import {
	ApiApplyApplication,
	ApiDeleteApplication,
	ApiWithdrawApplication,
} from '../swagger/application.swagger';

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

	@Delete('/:id/withdraw')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiWithdrawApplication()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async withdrawApplication(
		@Param('id') id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<void> {
		return await this.applicationService.withdrawApplication(id, request.user);
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiDeleteApplication()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async deleteApplicationById(
		@Param('id') id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<void> {
		return await this.applicationService.deleteApplicationById(
			id,
			request.user,
		);
	}
}

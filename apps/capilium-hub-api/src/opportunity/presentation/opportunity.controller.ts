import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guard/admin.guard';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import { OpportunityCreateDto } from '../dto/opportunityCreateDto';
import { OpportunityResponseDto } from '../dto/opportunityResponseDto';
import { OpportunityService } from '../opportunity.service';
import {
	ApiCreateOpportunity,
	ApiDeleteOpportunityById,
	ApiFindAllOpenedOpportunities,
	ApiFindOpportunityById,
	ApiUpdatedOpportunityById,
} from '../swagger/opportunity.swagger';

@ApiTags('opportunity')
@Controller('opportunity')
export class OpportunityController {
	protected readonly _logger = new Logger(OpportunityController.name);
	constructor(private readonly opportunityService: OpportunityService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiCreateOpportunity()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async create(
		@Body() opportunity: OpportunityCreateDto,
		@Req() request: AuthenticatedRequest,
	) {
		const userId = request.user.id;

		return await this.opportunityService.create(opportunity, userId);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@ApiFindOpportunityById()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async findById(
		@Param('id') id: string,
	): Promise<Partial<OpportunityResponseDto>> {
		return await this.opportunityService.findOpportunityById(id);
	}

	@Get('findAllOpenedOpportunities')
	@HttpCode(HttpStatus.OK)
	@ApiFindAllOpenedOpportunities()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async findAllOpenedOpportunities(): Promise<OpportunityResponseDto[]> {
		return await this.opportunityService.findAllOpenedOpportunities();
	}

	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiDeleteOpportunityById()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard, AdminGuard)
	public async deleteOpportunity(
		@Param('id') id: string,
		@Req() request: AuthenticatedRequest,
	): Promise<void> {
		return await this.opportunityService.deleteOpportunityById(
			id,
			request.user,
		);
	}

	@Put('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiUpdatedOpportunityById()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard, AdminGuard)
	public async updateOpportunityById(
		@Param('id') id: string,
		@Body() newOpportunityData: Partial<OpportunityCreateDto>,
		@Req() request: AuthenticatedRequest,
	): Promise<Partial<OpportunityResponseDto>> {
		return await this.opportunityService.updateOpportunityById(
			id,
			newOpportunityData,
			request.user,
		);
	}
}

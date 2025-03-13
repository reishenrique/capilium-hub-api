import {
	Controller,
	HttpCode,
	Logger,
	Post,
	HttpStatus,
	Param,
	Get,
	Body,
	Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpportunityService } from '../opportunity.service';
import { OpportunityResponseDto } from '../dto/opportunityResponseDto';
import { OpportunityCreateDto } from '../dto/opportunityCreateDto';

@ApiTags('opportunity')
@Controller('opportunity')
export class OpportunityController {
	protected readonly _logger = new Logger(OpportunityController.name);
	constructor(private readonly opportunityService: OpportunityService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new opportunity' })
	@ApiResponse({ status: 201, type: OpportunityResponseDto })
	@ApiResponse({
		status: 409,
		description: 'Opportunity already registered in the system',
	})
	@ApiResponse({
		status: 400,
		description: 'Error when trying to create a new opportunity',
	})
	public async create(@Body() opportunity: OpportunityCreateDto) {
		return await this.opportunityService.create(opportunity);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Listing opportunity by id' })
	@ApiResponse({ status: 200, type: OpportunityCreateDto })
	@ApiResponse({
		status: 404,
		description: 'Opportunity not found',
	})
	@ApiResponse({
		status: 400,
		description: 'Error when trying to list a opportunity by id',
	})
	public async findById(
		@Param('id') id: string,
	): Promise<Partial<OpportunityResponseDto>> {
		return await this.opportunityService.findOpportunityById(id);
	}

	@Get('findAllOpenedOpportunities')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Listing all oportunities with "open" status' })
	@ApiResponse({ status: 200, type: [OpportunityResponseDto] })
	@ApiResponse({ status: 400, description: 'No open opportunities' })
	public async findAllOpenedOpportunities(): Promise<OpportunityResponseDto[]> {
		return await this.opportunityService.findAllOpenedOpportunities();
	}

	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete a opportunity by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({
		status: 404,
		description: 'Opportunity not found to delete',
	})
	public async deleteOpportunity(@Param('id') id: string): Promise<void> {
		return await this.opportunityService.deleteOpportunityById(id);
	}
}

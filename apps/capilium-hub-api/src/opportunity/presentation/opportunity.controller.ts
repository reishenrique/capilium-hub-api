import {
	Controller,
	HttpCode,
	Logger,
	Post,
	HttpStatus,
	Body,
	NotFoundException,
	InternalServerErrorException,
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
		try {
			const newOpportunity = await this.opportunityService.create(opportunity);
			return newOpportunity;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error when trying to create a new opportunity');
			throw new InternalServerErrorException(error.message);
		}
	}
}

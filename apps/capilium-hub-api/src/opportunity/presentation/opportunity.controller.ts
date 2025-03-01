import {
	Controller,
	HttpCode,
	Logger,
	Post,
	HttpStatus,
	Param,
	Get,
	Body,
	NotFoundException,
	InternalServerErrorException,
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
		try {
			const newOpportunity = await this.opportunityService.create(opportunity);
			return newOpportunity;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error when trying to create a new opportunity');
			throw new InternalServerErrorException(error.message);
		}
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
		try {
			const findById = await this.opportunityService.findOpportunityById(id);

			return findById;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error when trying to list opportunity by id');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Delete(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete a opportunity by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404, description: 'Opportunity not found to delete' })
	public async deleteOpportunity(@Param('id') id: string): Promise<void> {
		try {
			const deleteOpportunity =
				await this.opportunityService.deleteOpportunityById(id);

			return deleteOpportunity;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error when trying to delete a opportunity by id');
			throw new InternalServerErrorException(error.message);
		}
	}
}

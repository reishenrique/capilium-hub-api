import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OpportunityResponseDto } from '../dto/opportunityResponseDto';
import { applyDecorators } from '@nestjs/common';
import { OpportunityCreateDto } from '../dto/opportunityCreateDto';

export function ApiCreateOpportunity() {
	return applyDecorators(
		ApiOperation({ summary: 'Create a new opportunity' }),
		ApiResponse({ status: 201, type: OpportunityResponseDto }),
		ApiResponse({
			status: 409,
			description: 'Opportunity already registered in the system',
		}),
		ApiResponse({
			status: 400,
			description: 'Error when trying to create a new opportunity',
		}),
	);
}

export function ApiFindOpportunityById() {
	return applyDecorators(
		ApiOperation({ summary: 'Listing opportunity by id' }),
		ApiResponse({ status: 200, type: OpportunityCreateDto }),
		ApiResponse({
			status: 404,
			description: 'Opportunity not found',
		}),
		ApiResponse({
			status: 400,
			description: 'Error when trying to list a opportunity by id',
		}),
	);
}

export function ApiFindAllOpenedOpportunities() {
	return applyDecorators(
		ApiOperation({ summary: 'Listing all oportunities with "open" status' }),
		ApiResponse({ status: 200, type: [OpportunityResponseDto] }),
		ApiResponse({ status: 400, description: 'No open opportunities' }),
	);
}

export function ApiDeleteOpportunityById() {
	return applyDecorators(
		ApiOperation({ summary: 'Delete a opportunity by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({
			status: 404,
			description: 'Opportunity not found to delete',
		}),
	);
}

export function ApiUpdatedOpportunityById() {
	return applyDecorators(
		ApiOperation({ summary: 'Update a opportunity by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({
			status: 400,
			description: 'Opportunity not found to update',
		}),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

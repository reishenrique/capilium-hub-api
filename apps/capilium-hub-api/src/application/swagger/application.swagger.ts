import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiApplyApplication() {
	return applyDecorators(
		ApiOperation({
			summary: 'Creates registry of user application for opportunity',
		}),
		ApiResponse({ status: 201 }),
		ApiResponse({ status: 404, description: 'User not found' }),
		ApiResponse({
			status: 409,
			description: 'User has already applied for this opportunity',
		}),
	);
}

export function ApiWithdrawApplication() {
	return applyDecorators(
		ApiOperation({
			summary: 'Withdraw the authenticated user application for an opportunity',
		}),
		ApiResponse({ status: 204 }),
		ApiResponse({ status: 404, description: 'Application not found by id' }),
	);
}

export function ApiDeleteApplication() {
	return applyDecorators(
		ApiOperation({ summary: 'Delete application by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({
			status: 403,
			description:
				'Only the clinic administrator responsible for the opportunity can delete this application',
		}),
		ApiResponse({
			status: 404,
			description: 'Application or opportunity not found',
		}),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

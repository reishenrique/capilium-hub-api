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

export function ApiDeleteApplication() {
	return applyDecorators(
		ApiOperation({ summary: 'Delete application by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({ status: 400, description: 'Application not found by id' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

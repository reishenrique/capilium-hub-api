import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateUploadResume() {
	return applyDecorators(
		ApiOperation({ summary: 'Upload a pdf file and attach a user' }),
		ApiResponse({ status: 201 }),
		ApiResponse({ status: 404, description: 'User not found' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

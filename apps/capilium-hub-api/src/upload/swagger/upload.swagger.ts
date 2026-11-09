import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateUploadResume() {
	return applyDecorators(
		ApiOperation({ summary: 'Upload a pdf file and attach a user' }),
		ApiResponse({ status: 201 }),
		ApiResponse({ status: 400, description: 'Invalid file or missing file' }),
		ApiResponse({ status: 401, description: 'Unauthenticated' }),
		ApiResponse({
			status: 403,
			description: 'Cannot upload a resume for another user',
		}),
		ApiResponse({ status: 404, description: 'User not found' }),
		ApiResponse({ status: 413, description: 'File is too large' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

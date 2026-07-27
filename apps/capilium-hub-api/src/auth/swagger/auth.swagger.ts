import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiAuthLogin() {
	return applyDecorators(
		ApiOperation({ summary: 'Logging a user' }),
		ApiResponse({ status: 201, description: 'Login successful!' }),
		ApiResponse({
			status: 401,
			description: 'Unauthorized or Invalid password',
		}),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

export function ApiAuthRefreshToken() {
	return applyDecorators(
		ApiOperation({ summary: 'Refresh user access token' }),
		ApiResponse({
			status: 201,
			description: 'Access token updated successfully',
		}),
		ApiResponse({
			status: 400,
			description:
				'User email and refresh token is required to proceed with refresh',
		}),
		ApiResponse({ status: 404, description: 'User not found' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

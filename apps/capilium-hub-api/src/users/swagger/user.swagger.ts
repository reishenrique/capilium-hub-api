import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/userResponseDto';

export function ApiCreateUserSwaggerDocumentation() {
	return applyDecorators(
		ApiOperation({ summary: 'Create a new user' }),
		ApiResponse({ status: 201, type: UserResponseDto }),
		ApiResponse({
			status: 409,
			description: 'CPF already registered in the system',
		}),
		ApiResponse({
			status: 409,
			description: 'Email already registered in the system',
		}),
		ApiResponse({
			status: 400,
			description: 'Error when trying to created a new user',
		}),
	);
}

export function ApiGetUserByIdSwaggerDocumetation() {
	return applyDecorators(
		ApiOperation({ summary: 'Getting user by id' }),
		ApiResponse({ status: 200, type: UserResponseDto }),
		ApiResponse({ status: 404, description: 'User not found by id' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

export function ApiGetUserByCpfSwaggerDocumentation() {
	return applyDecorators(
		ApiOperation({ summary: 'Getting user by id' }),
		ApiResponse({ status: 200, type: UserResponseDto }),
		ApiResponse({ status: 404, description: 'User not found by CPF' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

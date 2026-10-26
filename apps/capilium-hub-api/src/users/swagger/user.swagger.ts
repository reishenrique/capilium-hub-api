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
			description: 'isAdmin cannot be set on public registration',
		}),
	);
}

export function ApiCreateClinicAdminSwaggerDocumentation() {
	return applyDecorators(
		ApiOperation({ summary: 'Create a clinic administrator' }),
		ApiResponse({ status: 201, type: UserResponseDto }),
		ApiResponse({
			status: 400,
			description: 'Administrator is not linked to a clinic',
		}),
		ApiResponse({ status: 401, description: 'Unauthorized' }),
		ApiResponse({
			status: 403,
			description: 'Only administrators can perform this action',
		}),
		ApiResponse({ status: 404, description: 'Clinic not found' }),
		ApiResponse({
			status: 409,
			description: 'CPF or email already registered in the system',
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

export function ApiDeleteUserSwaggerDocumentation() {
	return applyDecorators(
		ApiOperation({ summary: 'Delete user by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({ status: 400, description: 'User not found to delete' }),
		ApiResponse({ status: 500, description: 'Internal Server Error ' }),
	);
}

export function ApiUpdateUserSwaggerDocumentation() {
	return applyDecorators(
		ApiOperation({ summary: 'Upgrade a user by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({ status: 400, description: 'User not found to update' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

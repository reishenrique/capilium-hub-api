import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClinicResponseDto } from '../dto/clinicResponseDto';

export function ApiCreateClinic() {
	return applyDecorators(
		ApiOperation({ summary: 'Create a new clinic' }),
		ApiResponse({ status: 201, type: ClinicResponseDto }),
		ApiResponse({
			status: 409,
			description: 'CNPJ already registered in the system',
		}),
		ApiResponse({
			status: 400,
			description: 'Error when trying to created a new clinic',
		}),
	);
}

export function ApiFindAllActivatedClinics() {
	return applyDecorators(
		ApiOperation({ summary: 'Listing active clinics' }),
		ApiResponse({ status: 200, type: [ClinicResponseDto] }),
		ApiResponse({ status: 404, description: 'No clinics found' }),
	);
}

export function ApiFindClinicById() {
	return applyDecorators(
		ApiOperation({ summary: 'Getting clinic by id' }),
		ApiResponse({ status: 200, type: ClinicResponseDto }),
		ApiResponse({ status: 404, description: 'Clinic not found' }),
	);
}

export function ApiUpdateClinicById() {
	return applyDecorators(
		ApiOperation({ summary: 'Upgrade a clinic by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({ status: 400, description: 'Clinic not found to update' }),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

export function ApiDeleteClinicById() {
	return applyDecorators(
		ApiOperation({ summary: 'Delete clinic by id' }),
		ApiResponse({ status: 200 }),
		ApiResponse({ status: 400, description: 'Clinic not found to delete' }),
		ApiResponse({ status: 500, description: 'Internal Server Error ' }),
	);
}

export function ApiPaginatedClinics() {
	return applyDecorators(
		ApiOperation({ summary: 'Getting clinics with pagination' }),
		ApiResponse({ status: 200 }),
		ApiResponse({ status: 404, description: 'Clinics not found' }),
		ApiResponse({
			status: 400,
			description: 'Page and limit must be positive integer',
		}),
		ApiResponse({ status: 500, description: 'Internal Server Error' }),
	);
}

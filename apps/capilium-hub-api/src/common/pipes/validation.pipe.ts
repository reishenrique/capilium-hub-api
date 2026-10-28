import { ValidationPipe } from '@nestjs/common';

export function createGlobalValidationPipe(): ValidationPipe {
	return new ValidationPipe({
		whitelist: true,
		transform: true,
		transformOptions: {
			enableImplicitConversion: false,
		},
		validationError: {
			target: false,
			value: false,
		},
	});
}

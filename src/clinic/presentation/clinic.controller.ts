import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClinicService } from '../clinic.service';
import { CreateClinicDto } from '../dto/createClinicDto';

@ApiTags('clinic')
@Controller('clinic')
export class ClinicController {
		protected readonly _logger = new Logger(ClinicController.name);
		constructor(private readonly clinicService: ClinicService) {}

		@Post('/')
		@HttpCode(HttpStatus.CREATED)
		@ApiOperation({ summary: 'Create a new clinic' })
		@ApiResponse({ status: 201 })
		@ApiResponse({
			status: 409,
			description: 'CNPJ already registered in the system',
		})
		@ApiResponse({
			status: 400,
			description: 'Error when trying to created a new clinic',
		})
		public async create(@Body() clinic: CreateClinicDto): Promise<object> {
			try {
				const newClinic = await this.clinicService.create(clinic);

				return newClinic;
			} catch (error) {
				if (error instanceof ConflictException) throw error;

				this._logger.error('Error when trying to created a new clinic');
				throw new InternalServerErrorException(error.message);
			}
		}
	}

import {
	Body,
	ConflictException,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClinicService } from '../clinic.service';
import { CreateClinicDto } from '../dto/createClinicDto';
import { ClinicResponseDtoSwagger } from '../dto/clinicResponseDto';

@ApiTags('clinic')
@Controller('clinic')
export class ClinicController {
	protected readonly _logger = new Logger(ClinicController.name);
	constructor(private readonly clinicService: ClinicService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new clinic' })
	@ApiResponse({ status: 201, type: ClinicResponseDtoSwagger })
	@ApiResponse({
		status: 409,
		description: 'CNPJ already registered in the system',
	})
	@ApiResponse({
		status: 400,
		description: 'Error when trying to created a new clinic',
	})
	public async create(
		@Body() clinic: CreateClinicDto,
	): Promise<Partial<ClinicResponseDtoSwagger>> {
		try {
			const newClinic = await this.clinicService.create(clinic);

			return newClinic;
		} catch (error) {
			if (error instanceof ConflictException) throw error;

			this._logger.error('Error when trying to created a new clinic');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Get('findAll/')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Listing the clinics' })
	@ApiResponse({ status: 200, type: [ClinicResponseDtoSwagger] })
	@ApiResponse({ status: 404, description: 'No clinics found' })
	public async findAll(): Promise<ClinicResponseDtoSwagger[]> {
		try {
			const findAllClinics = await this.clinicService.findAllActivatedClinics();

			return findAllClinics;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error when trying to listing all clinics');
			throw new InternalServerErrorException(error.message);
		}
	}
}

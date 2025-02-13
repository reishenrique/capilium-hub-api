import {
	Body,
	ConflictException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Param,
	Post,
	Put,
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

	@Get('findAllActivatedClinics')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Listing active clinics' })
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

	@Get('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting clinic by id' })
	@ApiResponse({ status: 200, type: ClinicResponseDtoSwagger })
	@ApiResponse({ status: 404, description: 'Clinic not found' })
	public async findById(
		@Param('id') id: string,
	): Promise<ClinicResponseDtoSwagger> {
		try {
			const findClinicById = await this.clinicService.findClinicById(id);

			return findClinicById;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error when searching for a clinic by id');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Put('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Upgrade a clinic by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400, description: 'Clinic not found to update' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async upgradeClinicById(
		@Param('id') id: string,
		@Body() newClinicData: Partial<CreateClinicDto>,
	): Promise<ClinicResponseDtoSwagger> {
		try {
			const upgradeClinic = this.clinicService.upgradeClinicById(
				id,
				newClinicData,
			);

			return upgradeClinic;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error trying to update a clinic by id ');
			throw new InternalServerErrorException(error.message);
		}
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete clinic by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400, description: 'Clinic not found to delete' })
	@ApiResponse({ status: 500, description: 'Internal Server Error ' })
	public async deleteClinicById(id: string): Promise<void> {
		try {
			const deleteClinicById =
				await this.clinicService.findClinicByIdAndDelete(id);

			return deleteClinicById;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this._logger.error('Error trying delete a clinic by id ');
			throw new InternalServerErrorException(error.message);
		}
	}
}

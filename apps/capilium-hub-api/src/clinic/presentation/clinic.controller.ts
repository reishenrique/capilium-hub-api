import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	Put,
	Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClinicService } from '../clinic.service';
import { CreateClinicDto } from '../dto/createClinicDto';
import { ClinicResponseDto } from '../dto/clinicResponseDto';
import { Request } from 'express';
import { IPaginationResult } from '../interface/IPaginationResult';

@ApiTags('clinic')
@Controller('clinic')
export class ClinicController {
	protected readonly _logger = new Logger(ClinicController.name);
	constructor(private readonly clinicService: ClinicService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new clinic' })
	@ApiResponse({ status: 201, type: ClinicResponseDto })
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
	): Promise<Partial<ClinicResponseDto>> {
		return await this.clinicService.create(clinic);
	}

	@Get('findAllActivatedClinics')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Listing active clinics' })
	@ApiResponse({ status: 200, type: [ClinicResponseDto] })
	@ApiResponse({ status: 404, description: 'No clinics found' })
	public async findAll(): Promise<ClinicResponseDto[]> {
		return await this.clinicService.findAllActivatedClinics();
	}

	@Get('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting clinic by id' })
	@ApiResponse({ status: 200, type: ClinicResponseDto })
	@ApiResponse({ status: 404, description: 'Clinic not found' })
	public async findById(@Param('id') id: string): Promise<ClinicResponseDto> {
		return await this.clinicService.findClinicById(id);
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
	): Promise<ClinicResponseDto> {
		return await this.clinicService.upgradeClinicById(id, newClinicData);
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete clinic by id' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 400, description: 'Clinic not found to delete' })
	@ApiResponse({ status: 500, description: 'Internal Server Error ' })
	public async deleteClinicById(id: string): Promise<void> {
		return await this.clinicService.findClinicByIdAndDelete(id);
	}

	@Get('paginated')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Getting clinics with pagination' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 404, description: 'Clinics not found' })
	@ApiResponse({
		status: 400,
		description: 'Page and limit must be positive integer',
	})
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	public async getPaginatedClinics(
		@Req() req: Request,
	): Promise<IPaginationResult<ClinicResponseDto>> {
		const page = Number.parseInt(req.query.page as string) || 1;
		const limit = Number.parseInt(req.query.limit as string) || 10;

		return await this.clinicService.getPagedAllClinics(page, limit);
	}
}

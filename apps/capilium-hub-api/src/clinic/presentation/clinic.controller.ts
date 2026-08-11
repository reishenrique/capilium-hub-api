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
	UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClinicService } from '../clinic.service';
import { CliniCreateDto } from '../dto/clinicCreateDto';
import { ClinicResponseDto } from '../dto/clinicResponseDto';
import { Request } from 'express';
import { IPaginationResult } from '../interface/IPaginationResult';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import {
	ApiCreateClinic,
	ApiDeleteClinicById,
	ApiFindAllActivatedClinics,
	ApiFindClinicById,
	ApiPaginatedClinics,
	ApiUpdateClinicById,
} from '../swagger/clinic.swagger';

@ApiTags('clinic')
@Controller('clinic')
export class ClinicController {
	protected readonly _logger = new Logger(ClinicController.name);
	constructor(private readonly clinicService: ClinicService) {}

	@Post('/')
	@HttpCode(HttpStatus.CREATED)
	@ApiCreateClinic()
	@UseInterceptors(LoggingInterceptor)
	public async create(
		@Body() clinic: CliniCreateDto,
	): Promise<Partial<ClinicResponseDto>> {
		return await this.clinicService.create(clinic);
	}

	@Get('findAllActivatedClinics')
	@HttpCode(HttpStatus.OK)
	@ApiFindAllActivatedClinics()
	@UseInterceptors(LoggingInterceptor)
	public async findAll(): Promise<ClinicResponseDto[]> {
		return await this.clinicService.findAllActivatedClinics();
	}

	@Get('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiFindClinicById()
	@UseInterceptors(LoggingInterceptor)
	public async findById(@Param('id') id: string): Promise<ClinicResponseDto> {
		return await this.clinicService.findClinicById(id);
	}

	@Put('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiUpdateClinicById()
	@UseInterceptors(LoggingInterceptor)
	public async upgradeClinicById(
		@Param('id') id: string,
		@Body() newClinicData: Partial<CliniCreateDto>,
	): Promise<ClinicResponseDto> {
		return await this.clinicService.updateClinicById(id, newClinicData);
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiDeleteClinicById()
	@UseInterceptors(LoggingInterceptor)
	public async deleteClinicById(id: string): Promise<void> {
		return await this.clinicService.findClinicByIdAndDelete(id);
	}

	@Get('paginated')
	@HttpCode(HttpStatus.OK)
	@ApiPaginatedClinics()
	@UseInterceptors(LoggingInterceptor)
	public async getPaginatedClinics(
		@Req() req: Request,
	): Promise<IPaginationResult<ClinicResponseDto>> {
		const page = Number.parseInt(req.query.page as string) || 1;
		const limit = Number.parseInt(req.query.limit as string) || 10;

		return await this.clinicService.getPagedAllClinics(page, limit);
	}
}

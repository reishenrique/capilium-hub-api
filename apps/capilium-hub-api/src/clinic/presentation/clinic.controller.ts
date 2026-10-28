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
	Query,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guard/admin.guard';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import { ClinicService } from '../clinic.service';
import { CliniCreateDto } from '../dto/clinicCreateDto';
import { ClinicPaginationQueryDto } from '../dto/clinicPaginationQueryDto';
import { ClinicResponseDto } from '../dto/clinicResponseDto';
import { ClinicUpdateDto } from '../dto/clinicUpdateDto';
import { IPaginationResult } from '../interface/IPaginationResult';
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
	@UseGuards(JwtAuthGuard, AdminGuard)
	public async create(
		@Body() clinic: CliniCreateDto,
	): Promise<Partial<ClinicResponseDto>> {
		return await this.clinicService.create(clinic);
	}

	@Get('findAllActivatedClinics')
	@HttpCode(HttpStatus.OK)
	@ApiFindAllActivatedClinics()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async findAll(): Promise<ClinicResponseDto[]> {
		return await this.clinicService.findAllActivatedClinics();
	}

	@Get('paginated')
	@HttpCode(HttpStatus.OK)
	@ApiPaginatedClinics()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async getPaginatedClinics(
		@Query() pagination: ClinicPaginationQueryDto,
	): Promise<IPaginationResult<ClinicResponseDto>> {
		return await this.clinicService.getPagedAllClinics(
			pagination.page,
			pagination.limit,
		);
	}

	@Get('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiFindClinicById()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard)
	public async findById(@Param('id') id: string): Promise<ClinicResponseDto> {
		return await this.clinicService.findClinicById(id);
	}

	@Put('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiUpdateClinicById()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard, AdminGuard)
	public async upgradeClinicById(
		@Param('id') id: string,
		@Body() newClinicData: ClinicUpdateDto,
	): Promise<ClinicResponseDto> {
		return await this.clinicService.updateClinicById(id, newClinicData);
	}

	@Delete('/:id')
	@HttpCode(HttpStatus.OK)
	@ApiDeleteClinicById()
	@UseInterceptors(LoggingInterceptor)
	@UseGuards(JwtAuthGuard, AdminGuard)
	public async deleteClinicById(id: string): Promise<void> {
		return await this.clinicService.delete(id);
	}
}

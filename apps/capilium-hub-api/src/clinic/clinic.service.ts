import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ClinicRepository } from './repository/clinic.repository';
import { Logger } from '@nestjs/common';
import { CliniCreateDto } from './dto/clinicCreateDto';
import { ClinicResponseDto } from './dto/clinicResponseDto';
import { Clinic } from './entity/clinic.entity';
import { IPaginationResult } from './interface/IPaginationResult';
import EventEmitter2 from 'eventemitter2';
import { LogEventEnum } from '../logger/enum/log-event.enum';
import { LogLevelEnum } from '../logger/enum/log-level.enum';
import { CacheService } from '../infrastructure/cache/cache.service';
import { CacheKeyEnum } from '../common/enums/cache-keys.enum';

@Injectable()
export class ClinicService {
	protected readonly _logger = new Logger('ClinicService');
	eventEmitter: EventEmitter2;
	constructor(
		private readonly clinicRepository: ClinicRepository,
		private readonly cacheService: CacheService,
	) {}

	public async create(
		clinicPayload: CliniCreateDto,
	): Promise<Partial<ClinicResponseDto>> {
		const findClinicByCnpj = await this.clinicRepository.findClinicByCnpj(
			clinicPayload.cnpj,
		);

		if (findClinicByCnpj) {
			this._logger.error(
				`Clinic CNPJ: ${clinicPayload.cnpj} already registered`,
			);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Warning,
				message: 'Attempt to create clinic with duplicated CNPJ',
				context: 'ClinicService',
				data: {
					cnpj: clinicPayload.cnpj,
				},
			});

			throw new ConflictException('CNPJ already registered in the system');
		}

		const newClinic = await this.clinicRepository.createClinic(clinicPayload);

		return newClinic;
	}

	public async findAllActivatedClinics(): Promise<ClinicResponseDto[]> {
		const cachedClinics = await this.cacheService.get<ClinicResponseDto[]>(
			CacheKeyEnum.CLINIC_ACTIVATED,
		);

		if (cachedClinics) return cachedClinics;

		const clinics = await this.clinicRepository.findAllActivatedClinics();

		if (!clinics.length) {
			this._logger.log('No activated clinics found');

			return [];
		}

		await this.cacheService.set<ClinicResponseDto[]>(
			CacheKeyEnum.CLINIC_ACTIVATED,
			clinics,
		);

		return clinics;
	}

	public async findClinicById(id: string): Promise<ClinicResponseDto> {
		if (!id) {
			this._logger.error('The clinic id must be provided');
			throw new BadRequestException('Clinic id must be provided');
		}

		const cacheKey = `${CacheKeyEnum.CLINIC}:${id}`;

		const cachedClinic =
			await this.cacheService.get<ClinicResponseDto>(cacheKey);

		if (cachedClinic) return cachedClinic;

		const clinic = await this.clinicRepository.findClinicById(id);

		if (!clinic) {
			this._logger.error(`Clinic id "${id}" not found`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Clinic not fround by id',
				context: 'ClinicService',
				data: {
					id: id,
				},
			});

			throw new NotFoundException('Clinic not found');
		}

		await this.cacheService.set<ClinicResponseDto>(cacheKey, clinic);

		return clinic;
	}

	public async updateClinicById(
		id: string,
		newClinicData: object,
	): Promise<ClinicResponseDto> {
		const findClinicByIdAndUpdate =
			await this.clinicRepository.findClinicByIdAndUpdate(id, newClinicData);

		if (!findClinicByIdAndUpdate) {
			this._logger.error(`Clinic ID: ${id} not found to update`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Clinic not fround by id to update',
				context: 'ClinicService',
				data: {
					id: id,
				},
			});

			throw new NotFoundException('Clinic not found to update');
		}

		return findClinicByIdAndUpdate;
	}

	public async findClinicByIdAndDelete(id: string): Promise<void> {
		const findClinicById = await this.clinicRepository.findClinicById(id);

		if (!findClinicById) {
			this._logger.error(`Clinic ID: ${id} not found to delete`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Clinic not found to delete',
				context: 'ClinicService',
				data: {
					id: id,
				},
			});

			throw new NotFoundException('Clinic not found to delete');
		}

		await this.clinicRepository.deleteClinicById(id);
	}

	public async getPagedAllClinics(
		page: number,
		limit: number,
	): Promise<IPaginationResult<Clinic>> {
		if (page < 1 || limit < 1) {
			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Page and limit must be greater than 1',
				context: 'ClinicService',
				data: {
					pageNumber: page,
					limit: limit,
				},
			});

			throw new BadRequestException('Page and limit must be positive integer');
		}

		const paginatedResult = await this.clinicRepository.getPaginatedClinics(
			page,
			limit,
		);

		if (!paginatedResult) {
			this._logger.error('Clinics not found to paginate');

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Page and limit must be greater than 1',
				context: 'ClinicService',
				data: {
					pageNumber: page,
					limit: limit,
				},
			});

			throw new NotFoundException('Clinics not found');
		}

		return paginatedResult;
	}
}

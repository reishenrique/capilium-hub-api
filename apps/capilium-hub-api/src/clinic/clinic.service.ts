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

@Injectable()
export class ClinicService {
	protected readonly _logger = new Logger('ClinicService');
	eventEmitter: EventEmitter2;
	constructor(private readonly clinicRepository: ClinicRepository) {}

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

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'New clinic created',
			context: 'ClinicService',
			data: {
				clinicName: clinicPayload.clinicName,
				cnpj: clinicPayload.cnpj,
			},
		});

		return newClinic;
	}

	public async findAllActivatedClinics(): Promise<ClinicResponseDto[]> {
		const findAllClinics =
			await this.clinicRepository.findAllActivatedClinics();

		if (!findAllClinics.length) {
			this._logger.error('Clinics not found');

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Error listing clinics',
				context: 'AuthService',
			});

			throw new NotFoundException('No clinics found');
		}

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Clinics',
			context: 'AuthService',
		});

		return findAllClinics;
	}

	public async findClinicById(id: string): Promise<ClinicResponseDto> {
		if (!id) {
			this._logger.error(`Clinic ID: ${id} is invalid`);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Error,
				message: 'Id not provided or invalid',
				context: 'ClinicService',
				data: {
					id: id,
				},
			});

			throw new BadRequestException('Invalid ID');
		}

		const findClinicById = await this.clinicRepository.findClinicById(id);

		if (!findClinicById) {
			this._logger.error(`Clinic ID: ${id} not found`);

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

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Clinic find by id',
			context: 'ClinicService',
			data: {
				id: id,
			},
		});

		return findClinicById;
	}

	public async upgradeClinicById(
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

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Clinic updated',
			context: 'ClinicService',
			data: {
				id: id,
				body: newClinicData,
			},
		});

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

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Clinic deleted',
			context: 'ClinicService',
			data: {
				id: id,
			},
		});

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

		this.eventEmitter.emit(LogEventEnum.InternalLog, {
			level: LogLevelEnum.Success,
			message: 'Clinics paginated',
			context: 'ClinicService',
		});

		return paginatedResult;
	}
}

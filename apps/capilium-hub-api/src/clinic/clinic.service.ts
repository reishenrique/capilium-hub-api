import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ClinicRepository } from './repository/clinic.repository';
import { Logger } from '@nestjs/common';
import { CreateClinicDto } from './dto/createClinicDto';
import { ClinicResponseDtoSwagger } from './dto/clinicResponseDto';

@Injectable()
export class ClinicService {
	protected readonly _logger = new Logger('ClinicService');
	constructor(private readonly clinicRepository: ClinicRepository) {}

	async create(
		clinicPayload: CreateClinicDto,
	): Promise<Partial<ClinicResponseDtoSwagger>> {
		const findClinicByCnpj = await this.clinicRepository.findClinicByCnpj(
			clinicPayload.cnpj,
		);

		if (findClinicByCnpj) {
			throw new ConflictException('CNPJ already registered in the system');
		}

		const newClinic = await this.clinicRepository.createClinic(clinicPayload);

		return newClinic;
	}

	async findAll(): Promise<ClinicResponseDtoSwagger[]> {
		const findAllClinics = await this.clinicRepository.findAllClinics();

		if (!findAllClinics.length) {
			throw new NotFoundException('No clinics found');
		}

		return findAllClinics;
	}
}

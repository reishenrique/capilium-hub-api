import {
	BadRequestException,
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

	public async create(
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

	public async findAllActivatedClinics(): Promise<ClinicResponseDtoSwagger[]> {
		const findAllClinics =
			await this.clinicRepository.findAllActivatedClinics();

		if (!findAllClinics.length) {
			throw new NotFoundException('No clinics found');
		}

		return findAllClinics;
	}

	public async findClinicById(id: string): Promise<ClinicResponseDtoSwagger> {
		if (!id) throw new BadRequestException('Invalid ID');

		const findClinicById = await this.clinicRepository.findClinicById(id);

		if (!findClinicById) throw new NotFoundException('Clinic not found');

		return findClinicById;
	}
}

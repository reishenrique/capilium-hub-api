import { ConflictException, Injectable } from '@nestjs/common';
import { ClinicRepository } from './repository/clinic.repository';
import { Logger } from '@nestjs/common';
import { CreateClinicDto } from './dto/createClinicDto';

@Injectable()
export class ClinicService {
	protected readonly _logger = new Logger('ClinicService');
	constructor(private readonly clinicRepository: ClinicRepository) {}

	async newClinic(clinicPayload: CreateClinicDto): Promise<object> {
		const findClinicByCnpj = await this.clinicRepository.findClinicByCnpj(
			clinicPayload.cnpj,
		);

		if (findClinicByCnpj) {
			throw new ConflictException('CNPJ already registered in the system');
		}

		const newClinic = await this.clinicRepository.createClinic(clinicPayload);

		return newClinic;
	}
}

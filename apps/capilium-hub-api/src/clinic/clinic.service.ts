import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ClinicRepository } from './repository/clinic.repository';
import { Logger } from '@nestjs/common';
import { CreateClinicDto } from './dto/createClinicDto';
import { ClinicResponseDto } from './dto/clinicResponseDto';
import { Model } from 'mongoose';

@Injectable()
export class ClinicService {
	protected readonly _logger = new Logger('ClinicService');
	constructor(private readonly clinicRepository: ClinicRepository) {}

	public async create(
		clinicPayload: CreateClinicDto,
	): Promise<Partial<ClinicResponseDto>> {
		const findClinicByCnpj = await this.clinicRepository.findClinicByCnpj(
			clinicPayload.cnpj,
		);

		if (findClinicByCnpj) {
			throw new ConflictException('CNPJ already registered in the system');
		}

		const newClinic = await this.clinicRepository.createClinic(clinicPayload);

		return newClinic;
	}

	public async findAllActivatedClinics(): Promise<ClinicResponseDto[]> {
		const findAllClinics =
			await this.clinicRepository.findAllActivatedClinics();

		if (!findAllClinics.length) {
			throw new NotFoundException('No clinics found');
		}

		return findAllClinics;
	}

	public async findClinicById(id: string): Promise<ClinicResponseDto> {
		if (!id) throw new BadRequestException('Invalid ID');

		const findClinicById = await this.clinicRepository.findClinicById(id);

		if (!findClinicById) throw new NotFoundException('Clinic not found');

		return findClinicById;
	}

	public async upgradeClinicById(
		id: string,
		newClinicData: object,
	): Promise<ClinicResponseDto> {
		const findClinicByIdAndUpdate =
			await this.clinicRepository.findClinicByIdAndUpdate(id, newClinicData);

		if (!findClinicByIdAndUpdate)
			throw new NotFoundException('Clinic not found to update');

		return findClinicByIdAndUpdate;
	}

	public async findClinicByIdAndDelete(id: string): Promise<void> {
		const findClinicById = await this.clinicRepository.findClinicById(id);

		if (!findClinicById)
			throw new NotFoundException('Clinic not found to delete');

		await this.clinicRepository.deleteClinicById(id);
	}

	public async getPagedAllClinics(
		clinicModel: Model<ClinicResponseDto>,
		page: number,
		limit: number,
	) {
		if (page < 1 || limit < 1) {
			throw new BadRequestException('Page and limit must be positive integer');
		}

		const result = await this.clinicRepository.getPaginatedClinics(
			clinicModel,
			page,
			limit,
		);

		return result;
	}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clinic } from '../entity/clinic.entity';
import { ClinicDocument } from '../schemas/clinic.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClinicRepository {
	constructor(
		@InjectModel(Clinic.name)
		private readonly clinicModel: Model<ClinicDocument>,
	) {}

	async createClinic(clinic: Clinic): Promise<Clinic> {
		const newClinic = (await this.clinicModel.create(clinic)).save();
		return newClinic;
	}

	async findClinicById(id: string): Promise<Clinic> {
		const clinic = await this.clinicModel.findById(id).exec();
		return clinic;
	}

	async findClinicByCnpj(cnpj: string): Promise<Clinic> {
		const clinic = await this.clinicModel.findOne({ cnpj }).exec();
		return clinic;
	}

	async findAllActivatedClinics(): Promise<Clinic[]> {
		const clinics = await this.clinicModel.find({ active: true });
		return clinics;
	}

	async findClinicByIdAndUpdate(
		id: string,
		newClinicData: object,
	): Promise<Clinic> {
		const findClinicAndUpdate = await this.clinicModel.findByIdAndUpdate(
			id,
			newClinicData,
			{ new: true },
		);

		return findClinicAndUpdate;
	}
}

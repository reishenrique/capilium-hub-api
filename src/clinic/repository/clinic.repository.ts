import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClinicEntity } from '../entity/clinic.entity';
import { ClinicDocument } from '../schemas/clinic.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClinicRepository {
	constructor(
		@InjectModel(ClinicEntity.name)
		private readonly clinicModel: Model<ClinicDocument>,
	) {}

	async createClinic(clinic: ClinicEntity): Promise<ClinicEntity> {
		const newClinic = (await this.clinicModel.create(clinic)).save();
		return newClinic;
	}

	async findClinicById(id: string): Promise<ClinicEntity> {
		const clinic = await this.clinicModel.findById(id).exec();
		return clinic;
	}

	async findClinicByCnpj(cnpj: string): Promise<ClinicEntity> {
		const clinic = await this.clinicModel.findOne({ cnpj }).exec();
		return clinic;
	}
	
	async findAllClinics(): Promise<ClinicEntity[]> {
		const clinics = await this.clinicModel.find()
		return clinics
	}
}

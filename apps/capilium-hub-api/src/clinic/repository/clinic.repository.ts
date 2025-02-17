import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clinic } from '../entity/clinic.entity';
import { ClinicDocument } from '../schemas/clinic.schema';
import { Model } from 'mongoose';
import { IPaginationResult } from '../interface/IPaginationResult';

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

	async deleteClinicById(id: string): Promise<void> {
		await this.clinicModel.deleteOne({ _id: id }).exec();
	}

	async getPaginatedClinics(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		model: Model<any>,
		page: number,
		limit: number,
	): Promise<IPaginationResult<Clinic>> {
		const skip = (page - 1) * limit;

		const [results, totalDocuments] = await Promise.all([
			model.find().skip(skip).limit(limit).exec(),
			model.countDocuments().exec(),
		]);

		const totalPages = Math.ceil(totalDocuments / limit);

		return { totalDocuments, totalPages, currentPage: page, results };
	}
}

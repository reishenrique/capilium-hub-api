import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicController } from './presentation/clinic.controller';
import { Clinic } from './entity/clinic.entity';
import { ClinicRepository } from './repository/clinic.repository';
import { ClinicService } from './clinic.service';
import { ClinicSchema } from './schemas/clinic.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Clinic.name,
				schema: ClinicSchema,
			},
		]),
	],
	controllers: [ClinicController],
	providers: [ClinicService, ClinicRepository],
	exports: [MongooseModule, ClinicService, ClinicRepository],
})
export class ClinicModule {}

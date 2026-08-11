import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatusEnum } from '../../common/enums/availability.enum';
import { ProfessionEnum } from '../../common/enums/profession.enum';
import { SpecializationEnum } from '../../common/enums/specialization.enum';

@Schema({ timestamps: true })
export class User {
	@ApiProperty()
	@Prop()
	firstName: string;

	@ApiProperty()
	@Prop()
	lastName: string;

	@ApiProperty()
	@Prop()
	cpf: string;

	@ApiProperty()
	@Prop()
	email: string;

	@ApiProperty()
	@Prop()
	password: string;

	@ApiProperty()
	@Prop({ type: String, enum: ProfessionEnum })
	profession: ProfessionEnum;

	@ApiProperty()
	@Prop()
	specialization: SpecializationEnum[];

	@ApiProperty()
	@Prop({ type: String, enum: AvailabilityStatusEnum })
	availabilityStatus: AvailabilityStatusEnum;

	@ApiProperty()
	@Prop()
	professionalExperience: string;

	@ApiProperty({ required: false })
	@Prop()
	portfolio?: string;

	@ApiProperty({ required: false })
	@Prop()
	resume?: string;

	@ApiProperty({ required: false })
	@Prop()
	isAdmin?: boolean;

	@ApiProperty({ required: false })
	@Prop()
	clinicId?: string;
}

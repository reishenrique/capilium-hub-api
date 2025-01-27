import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type { AvailabilityStatusEnum } from '../../common/enums/availability.enum';
import type { ProfessionEnum } from '../../common/enums/profession.enum';
import type { SpecializationEnum } from '../../common/enums/specialization.enum';

@Schema({ timestamps: true })
export class UserEntity {
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
	@Prop()
	profession: ProfessionEnum;

	@ApiProperty()
	@Prop()
	specialization: SpecializationEnum[];

	@ApiProperty()
	@Prop()
	availabilityStatus: AvailabilityStatusEnum;

	@ApiProperty()
	@Prop()
	professionalExperience: string;

	@ApiProperty({ required: false })
	@Prop()
	portfolio?: string;
}

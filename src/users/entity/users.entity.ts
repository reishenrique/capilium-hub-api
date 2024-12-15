import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import type { AvailabilityStatusEnum } from '../enum/availability.enum';
import type { ProfessionEnum } from '../enum/profession.enum';
import type { SpecializationEnum } from '../enum/specialization.enum';

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
	profession: ProfessionEnum;

	@ApiProperty()
	@Prop()
	specializaion: SpecializationEnum[];

	@ApiProperty()
	@Prop()
	availabilityStatus: AvailabilityStatusEnum;

	@ApiProperty()
	@Prop()
	professionalExperience: string;

	@ApiProperty({ required: false })
	@Prop()
	portfolio: string;
}

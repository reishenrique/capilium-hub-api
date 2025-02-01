import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SocialNetworksEnum } from 'src/common/enums/social-networks.enum';
import { SpecializationEnum } from 'src/common/enums/specialization.enum';

@Schema({ timestamps: true })
export class Clinic {
	@ApiProperty()
	@Prop()
	clinicName: string;

	@ApiProperty()
	@Prop()
	address: string;

	@ApiProperty()
	@Prop()
	contact: string;

	@ApiProperty()
	@Prop()
	socialNetworks: SocialNetworksEnum;

	@ApiProperty()
	@Prop()
	specializations: SpecializationEnum;

	@ApiProperty()
	@Prop()
	corporateName: string;

	@ApiProperty()
	@Prop()
	cnpj: string;

	@ApiProperty()
	@Prop()
	openingDays: number;

	@ApiProperty()
	@Prop()
	technicalManager: string;
}

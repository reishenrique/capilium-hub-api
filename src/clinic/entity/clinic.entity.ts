import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SocialNetworksEnum } from 'src/common/enums/social-networks.enum';

@Schema({ timestamps: true })
export class ClinicEntity {
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
	specializations: string;

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

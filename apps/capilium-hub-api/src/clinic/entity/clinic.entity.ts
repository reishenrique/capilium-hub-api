import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { SocialNetworksEnum } from '../../common/enums/social-networks.enum';
import { SpecializationEnum } from '../../common/enums/specialization.enum';
import { Optional } from '@nestjs/common';

@Schema({ timestamps: true })
export class Clinic {
	@ApiProperty()
	@Optional()
	_id?: string;

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
	@Prop({ type: String, enum: SocialNetworksEnum })
	socialNetworks: SocialNetworksEnum;

	@ApiProperty()
	@Prop({ type: String, enum: SpecializationEnum })
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

	@ApiProperty()
	@Prop()
	active: boolean;
}

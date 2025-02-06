import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
} from 'class-validator';
import { SocialNetworksEnum } from '../../common/enums/social-networks.enum';
import { SpecializationEnum } from '../../common/enums/specialization.enum';

export class CreateClinicDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	clinicName: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	address: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	contact: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsEnum(SocialNetworksEnum)
	socialNetworks: SocialNetworksEnum;

	@ApiProperty()
	@IsNotEmpty()
	@IsEnum(SpecializationEnum)
	specializations: SpecializationEnum;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	corporateName: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	cnpj: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	openingDays: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	technicalManager: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsBoolean()
	active: boolean;
}

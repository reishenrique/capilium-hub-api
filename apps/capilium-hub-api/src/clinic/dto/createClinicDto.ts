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
	@ApiProperty({
		example: 'John Hair Clinic',
		description: 'Name of the clinic you are registering with',
	})
	@IsNotEmpty({ message: 'The "clinicName" is required' })
	@IsString({ message: 'The "clinicName" field must be a string' })
	clinicName: string;

	@ApiProperty({
		example: '350 5th Ave, New York',
		description: 'Clinic address',
	})
	@IsNotEmpty({ message: 'The "address" is required' })
	@IsString({ message: 'The "address" field must be a string' })
	address: string;

	@ApiProperty({ example: '12345678', description: 'Clinic contact' })
	@IsNotEmpty({ message: 'The "address" is required' })
	@IsString({ message: 'The "address" field must be a string' })
	contact: string;

	@ApiProperty({ example: 'Instagram', description: 'Clinic social network' })
	@IsNotEmpty({ message: 'The "socialNetworks" is required' })
	@IsEnum(SocialNetworksEnum, {
		message:
			'The "socialNetworks" field must be a valid SocialNetworksEnum value',
	})
	socialNetworks: SocialNetworksEnum;

	@ApiProperty({
		example: 'Hair Transplant',
		description: 'Clinic specialization',
	})
	@IsNotEmpty({ message: 'The "specializations" is required' })
	@IsEnum(SpecializationEnum, {
		message:
			'The "specializations" field must be a valid SpecializationEnum value',
	})
	specializations: SpecializationEnum;

	@ApiProperty({
		example: 'Generic name',
		description: 'Clinic corporate name or group name',
	})
	@IsNotEmpty({ message: 'The "corporateName" is required' })
	@IsString({ message: 'The "corporateName" field must be a string' })
	corporateName: string;

	@ApiProperty({ example: '12345652912348', description: 'Clinic CNPJ' })
	@IsNotEmpty({ message: 'The "cnpj" is required' })
	@IsString({ message: 'The "cnpj" field must be a string' })
	cnpj: string;

	@ApiProperty({
		example: 5,
		description: 'Clinic days worked during the 7-day week',
	})
	@IsNotEmpty({ message: 'The "openingDays" is required' })
	@IsNumber()
	openingDays: number;

	@ApiProperty({
		example: 'John Doe',
		description: 'Name of the technician responsible for the clinic',
	})
	@IsNotEmpty({ message: 'The "technicalManager" is required' })
	@IsString({ message: 'The "technicalManager" field must be a string' })
	technicalManager: string;

	@ApiProperty({
		example: true || false,
		description: 'Flag that identifies whether the clinic is active',
	})
	@IsNotEmpty({ message: 'The "active" is required' })
	@IsBoolean({ message: 'The "active" field must be a boolean' })
	active: boolean;
}

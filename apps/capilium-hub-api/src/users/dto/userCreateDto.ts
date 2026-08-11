import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';
import { ProfessionEnum } from '../../common/enums/profession.enum';
import { SpecializationEnum } from '../../common/enums/specialization.enum';
import { AvailabilityStatusEnum } from '../../common/enums/availability.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateDto {
	@ApiProperty({
		example: 'John',
		description: 'First name of the user',
	})
	@IsNotEmpty({ message: 'The "firstName" is required' })
	@IsString({ message: 'The "firstName" field must be a string' })
	firstName: string;

	@ApiProperty({
		example: 'Doe',
		description: 'Last name of the user',
	})
	@IsNotEmpty({ message: 'The "lastName" is required' })
	@IsString({ message: 'The "lastName" field must be a string' })
	lastName: string;

	@ApiProperty({
		example: '12345678901',
		description: 'CPF (tax identification number) of the user',
	})
	@IsNotEmpty({ message: 'The "cpf" is required' })
	@IsString({ message: 'The "cpf" field must be a string' })
	cpf: string;

	@ApiProperty({
		example: 'johndoe@test.com',
		description: 'User email',
	})
	@IsNotEmpty({ message: 'The "email" is required' })
	@IsString({ message: 'The "email" field must be a string' })
	email: string;

	@ApiProperty({
		example: '123@Test',
		description: 'Password user',
	})
	@IsNotEmpty({ message: 'The "password" is required' })
	@IsString({ message: 'The "password" field can be anything' })
	password: string;

	@ApiProperty({
		example: 'Dermatologist',
		description: 'Profession of the user',
	})
	@IsNotEmpty({ message: 'The "profession" is required' })
	@IsEnum(ProfessionEnum, {
		message: 'The "profession" field must be a valid ProfessionEnum value',
	})
	profession: ProfessionEnum;

	@ApiProperty({
		example: ['Hair Transplant'],
		description: 'List of user specializations',
		type: [String],
	})
	@IsNotEmpty({ message: 'The "specialization" is required' })
	@IsArray({ message: 'The "specialization" field must be an array' })
	@IsEnum(SpecializationEnum, {
		each: true,
		message: 'Each "specialization" must be a valid SpecializationEnum value',
	})
	specialization: SpecializationEnum[];

	@ApiProperty({
		example: 'Available',
		description: 'Availability status of the user',
	})
	@IsNotEmpty({ message: 'The "availabilityStatus" is required' })
	@IsEnum(AvailabilityStatusEnum, {
		message:
			'The "availabilityStatus" field must be a valid AvailabilityStatusEnum value',
	})
	availabilityStatus: AvailabilityStatusEnum;

	@ApiProperty({
		example: '3 years',
		description: 'Professional experience of the user',
	})
	@IsNotEmpty({ message: 'The "professionalExperience" is required' })
	@IsString({
		message: 'The "professionalExperience" field must be a string',
	})
	professionalExperience: string;

	@ApiProperty({
		example: 'www.teste.com.br',
		description:
			'User professional portfolio URL or document (Upload coming soon)',
	})
	@IsOptional()
	@IsString({ message: 'The portfolio must be a string' })
	portfolio?: string;

	@ApiProperty({
		example: true || false,
		description:
			'Flag that identifies whether the user will be created as a clinic admin',
	})
	@IsOptional()
	@IsBoolean()
	isAdmin?: boolean;

	@ApiProperty({
		example: '',
		description:
			'Identifies the clinic for which the administrador user will be creatted',
	})
	@IsOptional()
	@IsString()
	clinicId?: string;

	@ApiProperty({
		example: '',
		description: 'CNPJ provided by the administrator responsible for a clinic',
	})
	@IsOptional()
	@IsString()
	clinicCnpj?: string;
}

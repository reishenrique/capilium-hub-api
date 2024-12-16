import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';
import { ProfessionEnum } from '../enum/profession.enum';
import { SpecializationEnum } from '../enum/specialization.enum';
import { AvailabilityStatusEnum } from '../enum/availability.enum';

export class UserDTO {
	@IsNotEmpty({ message: 'The "firstName" is required' })
	@IsString({ message: 'The "firstName" field must be a string' })
	firstName: string;

	@IsNotEmpty({ message: 'The "lastName" is required' })
	@IsString({ message: 'The "lastName" field must be a string' })
	lastName: string;

	@IsNotEmpty({ message: 'The "cpf" is required' })
	@IsString({ message: 'The "cpf" field must be a string' })
	cpf: string;

	@IsNotEmpty({ message: 'The "profession" is required' })
	@IsEnum(ProfessionEnum, {
		message: 'The "profession" field must be a valid ProfessionEnum value',
	})
	profession: ProfessionEnum;

	@IsNotEmpty({ message: 'The "specialization" is required' })
	@IsArray({ message: 'The "specialization" field must be an array' })
	@IsEnum(SpecializationEnum, {
		each: true,
		message: 'Each "specialization" must be a valid SpecializationEnum value',
	})
	specialization: SpecializationEnum[];

	@IsNotEmpty({ message: 'The "availabilityStatus" is required' })
	@IsEnum(AvailabilityStatusEnum, {
		message:
			'The "availabilityStatus" field must be a valid AvailabilityStatusEnum value',
	})
	availabilityStatus: AvailabilityStatusEnum;

	@IsNotEmpty({ message: 'The "professionalExperience" is required' })
	@IsString({
		message: 'The "professionalExperience" field must be a string',
	})
	professionalExperience: string;

	@IsOptional()
	@IsString({ message: 'The portfolio must be a string' })
	portfolio?: string;
}

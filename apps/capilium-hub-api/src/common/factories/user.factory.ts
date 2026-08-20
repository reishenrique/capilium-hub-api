import { UserCreateDto } from '../../users/dto/userCreateDto';
import { UserResponseDto } from '../../users/dto/userResponseDto';
import { User } from '../../users/entity/users.entity';
import { AvailabilityStatusEnum } from '../enums/availability.enum';
import { ProfessionEnum } from '../enums/profession.enum';
import { SpecializationEnum } from '../enums/specialization.enum';

export const createUserMock = (
	overrides?: Partial<UserCreateDto>,
): UserCreateDto => ({
	firstName: 'John',
	lastName: 'Doe',
	cpf: '12345678901',
	email: 'johndoe@test.com',
	password: '123@Test',
	profession: ProfessionEnum.Dermatologist,
	specialization: [SpecializationEnum.HairTransplant],
	availabilityStatus: AvailabilityStatusEnum.Available,
	professionalExperience: '3 years',
	isAdmin: false,
	...overrides,
});

export const createUserEntityMock = (
	overrides?: Partial<User> & { _id?: string },
): User => ({
	firstName: 'John',
	lastName: 'Doe',
	cpf: '12345678901',
	email: 'johndoe@test.com',
	password: '$2b$10$hashedpassword',
	profession: ProfessionEnum.Dermatologist,
	specialization: [SpecializationEnum.HairTransplant],
	availabilityStatus: AvailabilityStatusEnum.Available,
	professionalExperience: '3 years',
	isAdmin: false,
	...overrides,
});

export const createUserResponseMock = (
	overrides?: Partial<UserResponseDto>,
): UserResponseDto => ({
	_id: 'user-id-1',
	firstName: 'John',
	lastName: 'Doe',
	cpf: '12345678901',
	email: 'johndoe@test.com',
	profession: ProfessionEnum.Dermatologist,
	specialization: [SpecializationEnum.HairTransplant],
	availabilityStatus: AvailabilityStatusEnum.Available,
	professionalExperience: '3 years',
	isAdmin: false,
	createdAt: '2024-12-16T18:50:18.436Z',
	updatedAt: '2024-12-16T18:50:18.436Z',
	__v: 0,
	...overrides,
});

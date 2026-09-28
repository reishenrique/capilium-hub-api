import { UserResponseDto } from '../dto/userResponseDto';
import { User } from '../entity/users.entity';

export function toUserResponseDto(
	user: Omit<User, 'password'>,
): UserResponseDto {
	return {
		_id: user._id,
		firstName: user.firstName,
		lastName: user.lastName,
		cpf: user.cpf,
		email: user.email,
		profession: user.profession,
		specialization: user.specialization,
		availabilityStatus: user.availabilityStatus,
		professionalExperience: user.professionalExperience,
		isAdmin: user.isAdmin,
		clinicId: user.clinicId,
		createdAt: null,
		updatedAt: null,
		__v: null,
	};
}


import { UserResponseDto } from '../dto/userResponseDto';
import { UserDocument } from '../schemas/users.schema';

export function toUserResponseDto(
	user: Omit<UserDocument, 'password'>,
): UserResponseDto {
	return {
		_id: user._id.toString(),
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

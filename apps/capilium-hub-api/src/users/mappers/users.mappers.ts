import { UserResponseDto } from '../dto/userResponseDto';
import { UserDocument } from '../schemas/users.schema';

export function toUserResponseDto(
	user: Omit<UserDocument, 'password'>,
): UserResponseDto {
	const userObject = user.toObject();

	return {
		...userObject,
		_id: user._id.toString(),
	};
}

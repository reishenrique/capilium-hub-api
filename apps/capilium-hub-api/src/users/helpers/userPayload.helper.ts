import { UserCreateDto } from '../dto/userCreateDto';

export function removePrivilegedFields(
	newUserData: Partial<UserCreateDto>,
): Partial<UserCreateDto> {
	const { isAdmin, clinicId, clinicCnpj, ...allowedFields } = newUserData;

	return allowedFields;
}

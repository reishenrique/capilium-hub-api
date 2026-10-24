import { ClinicResponseDto } from '../dto/clinicResponseDto';
import { ClinicDocument } from '../schemas/clinic.schema';

export function toClinicResponseDto(clinic: ClinicDocument): ClinicResponseDto {
	const clinicObject = clinic.toObject();

	return {
		...clinicObject,
		_id: clinic._id.toString(),
	};
}

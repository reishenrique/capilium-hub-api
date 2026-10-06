import { ApplicationResponseDto } from '../dto/applicationResponseDto';
import { ApplicationDocument } from '../schemas/applications.schema';

export function toApplicationResponseDto(
	application: ApplicationDocument,
): ApplicationResponseDto {
	const applicationObject = application.toObject();

	return {
		...applicationObject,
		_id: application._id.toString(),
	};
}

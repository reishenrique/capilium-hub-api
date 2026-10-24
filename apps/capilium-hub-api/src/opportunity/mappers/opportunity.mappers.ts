import { OpportunityResponseDto } from '../dto/opportunityResponseDto';
import { OpportunityDocument } from '../schemas/opportunity.schema';

export function toOpportunityResponseDto(
	opportunity: OpportunityDocument,
): OpportunityResponseDto {
	const opportunityObj = opportunity.toObject();

	return {
		...opportunityObj,
		_id: opportunity._id.toString(),
	};
}

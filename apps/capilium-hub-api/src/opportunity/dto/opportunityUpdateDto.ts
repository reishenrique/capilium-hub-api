import { PartialType } from '@nestjs/swagger';
import { OpportunityCreateDto } from './opportunityCreateDto';

export class OpportunityUpdateDto extends PartialType(OpportunityCreateDto) {}

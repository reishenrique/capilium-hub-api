import { PartialType } from '@nestjs/swagger';
import { CliniCreateDto } from './clinicCreateDto';

export class ClinicUpdateDto extends PartialType(CliniCreateDto) {}

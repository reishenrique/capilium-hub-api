import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Application {
	@ApiProperty()
	@Prop({ type: Types.ObjectId, ref: 'Opportunity', required: true })
	opportunityId: Types.ObjectId;

	@ApiProperty()
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	appliedUserId: Types.ObjectId;
}

import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Application {
	@ApiProperty()
	@Prop({ type: Types.ObjectId, ref: 'Opportunity', required: true })
	opportunity: Types.ObjectId;

	@ApiProperty()
	@Prop({ type: Types.ObjectId, ref: 'User', required: true })
	applicant: Types.ObjectId;

	@ApiProperty()
	@Prop({ default: Date.now })
	appliedAt: Date;
}

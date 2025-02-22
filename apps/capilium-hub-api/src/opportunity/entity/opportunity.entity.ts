import { Schema, Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from '../../common/enums/status.enum';
import { Types } from 'mongoose';
import { Optional } from '@nestjs/common';

@Schema({ timestamps: true })
export class Opportunity {
	@ApiProperty()
	@Prop()
	title: string;

	@ApiProperty()
	@Prop()
	description: string;

	@ApiProperty()
	@Prop()
	location: string;

	@ApiProperty()
	@Prop()
	salary: number;

	@ApiProperty()
	@Prop({ type: String, enum: StatusEnum, default: StatusEnum.Open })
	status: StatusEnum;

	@ApiProperty()
	@Prop({ type: Types.ObjectId, ref: 'Clinic' })
	clinicName: string;

	@ApiProperty()
	@Prop({
		type: [{ type: Types.ObjectId, ref: 'User' }],
		default: [],
	})
	applicants?: string[];
}

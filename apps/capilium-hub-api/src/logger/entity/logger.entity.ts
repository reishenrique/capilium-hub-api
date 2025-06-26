import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Log {
	@Prop() level: string;
	@Prop() message: string;
	@Prop() context?: string;
	@Prop({ type: Object }) data?: Record<string, string>;
}

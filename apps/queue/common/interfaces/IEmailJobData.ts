import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';

export interface IEmailJobData {
	to: string;
	subject: string;
	body: string;
	metadata?: {
		emailType?: EmailTypeEnum;
	};
}

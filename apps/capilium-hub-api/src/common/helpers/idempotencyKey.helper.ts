import { EmailTypeEnum } from '@app/shared/enums/email-type.enum';

export function generateIdempotencyKey(
	userId: string,
	emailType: EmailTypeEnum,
	opportunityId?: string,
): string {
	if (emailType === EmailTypeEnum.APPLICATION) {
		return `email:application:${userId}:${opportunityId}`;
	}

	return `email:welcome:${userId}`;
}

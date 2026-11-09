import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class GlobalAdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

		if (!request.user?.isAdmin || request.user.clinicId) {
			throw new ForbiddenException(
				'Only global administrators can perform this action',
			);
		}

		return true;
	}
}

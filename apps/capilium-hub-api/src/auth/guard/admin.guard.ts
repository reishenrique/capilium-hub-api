import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/IAuthenticatedRequest';

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

		if (!request.user?.isAdmin) {
			throw new ForbiddenException(
				'Only administrators can perform this action',
			);
		}

		return true;
	}
}

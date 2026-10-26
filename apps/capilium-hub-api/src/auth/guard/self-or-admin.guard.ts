import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticared-request.interface';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const targetUserId = request.params.id;

		if (request.user?.id !== targetUserId && !request.user?.isAdmin) {
			throw new ForbiddenException(
				'You can only access or modify your own account',
			);
		}

		return true;
	}
}

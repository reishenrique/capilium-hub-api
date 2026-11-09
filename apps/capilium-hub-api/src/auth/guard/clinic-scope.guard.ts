import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class ClinicScopeGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const targetClinicId = request.params.id;
		const actor = request.user;

		if (!actor?.isAdmin) {
			throw new ForbiddenException(
				'Only administrators can perform this action',
			);
		}

		if (actor.clinicId && actor.clinicId !== targetClinicId) {
			throw new ForbiddenException('You can only manage your own clinic');
		}

		return true;
	}
}

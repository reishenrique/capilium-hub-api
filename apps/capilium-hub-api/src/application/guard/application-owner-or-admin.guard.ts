import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../../auth/interfaces/IAuthenticatedRequest';
import { ApplicationRepository } from '../repository/application.repository';

@Injectable()
export class ApplicationOwnerOrAdminGuard implements CanActivate {
	constructor(private readonly applicationRepository: ApplicationRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const application = await this.applicationRepository.listApplicationById(
			request.params.id,
		);

		if (!application) {
			throw new NotFoundException('Application not found by id');
		}

		const isOwner = application.userIds?.some(
			(userId) => userId.toString() === request.user?.id,
		);

		if (!request.user?.isAdmin && !isOwner) {
			throw new ForbiddenException(
				'Only the applicant or an administrator can delete this application',
			);
		}

		return true;
	}
}

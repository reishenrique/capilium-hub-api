import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UploadRepository } from './repository/upload.repository';
import { UserRepository } from '../users/repository/user.repository';

@Injectable()
export class UploadService {
	protected readonly _logger = new Logger('UploadService');
	constructor(
		private readonly uploadRepository: UploadRepository,
		private readonly userRepository: UserRepository,
	) {}

	async attachResumeIntoUser(
		userId: string,
		resumeFileName: string,
	): Promise<{ message: string; filename: string }> {
		const user = await this.userRepository.findUserById(userId);
		if (!user) throw new NotFoundException('User not found');

		await this.uploadRepository.updateResumeIntoUser(userId, resumeFileName);

		return {
			message: 'Resume uploaded successfully',
			filename: resumeFileName,
		};
	}
}

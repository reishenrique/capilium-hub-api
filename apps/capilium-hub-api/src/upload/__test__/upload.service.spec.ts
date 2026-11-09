import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../users/repository/user.repository';
import { UploadRepository } from '../repository/upload.repository';
import { UploadService } from '../upload.service';

describe('UploadService', () => {
	const uploadRepository = {
		updateResumeIntoUser: jest.fn(),
	};
	const userRepository = {
		findUserById: jest.fn(),
	};
	const service = new UploadService(
		uploadRepository as unknown as UploadRepository,
		userRepository as unknown as UserRepository,
	);

	beforeEach(() => {
		uploadRepository.updateResumeIntoUser.mockReset();
		userRepository.findUserById.mockReset();
	});

	it('updates the resume only for the target user', async () => {
		userRepository.findUserById.mockResolvedValue({ _id: 'user-a' });

		await expect(
			service.attachResumeIntoUser('user-a', 'resume.pdf'),
		).resolves.toEqual({
			message: 'Resume uploaded successfully',
			filename: 'resume.pdf',
		});

		expect(userRepository.findUserById).toHaveBeenCalledWith('user-a');
		expect(uploadRepository.updateResumeIntoUser).toHaveBeenCalledTimes(1);
		expect(uploadRepository.updateResumeIntoUser).toHaveBeenCalledWith(
			'user-a',
			'resume.pdf',
		);
	});

	it('does not update any user when the target does not exist', async () => {
		userRepository.findUserById.mockResolvedValue(null);

		await expect(
			service.attachResumeIntoUser('missing-user', 'resume.pdf'),
		).rejects.toBeInstanceOf(NotFoundException);

		expect(uploadRepository.updateResumeIntoUser).not.toHaveBeenCalled();
	});
});

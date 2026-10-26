import { ApplicationRepository } from './application.repository';

describe('ApplicationRepository', () => {
	it('deletes an application only when it has no applicants left', async () => {
		const exec = jest.fn().mockResolvedValue(undefined);
		const applicationModel = {
			findOneAndDelete: jest.fn().mockReturnValue({ exec }),
		};
		const repository = new ApplicationRepository(applicationModel as any);

		await repository.deleteApplicationIfEmpty('application-id');

		expect(applicationModel.findOneAndDelete).toHaveBeenCalledWith({
			_id: 'application-id',
			userIds: { $size: 0 },
		});
		expect(exec).toHaveBeenCalledTimes(1);
	});
});

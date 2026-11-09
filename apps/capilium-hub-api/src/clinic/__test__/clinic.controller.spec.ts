import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { JwtStrategy } from '../../auth/strategy/jwt.strategy';
import { UserRepository } from '../../users/repository/user.repository';
import { ClinicService } from '../clinic.service';
import { ClinicController } from '../presentation/clinic.controller';

const users = {
	globalAdmin: {
		_id: 'global-admin',
		email: 'global-admin@test.com',
		isAdmin: true,
	},
	clinicAdminA: {
		_id: 'clinic-admin-a',
		email: 'clinic-admin-a@test.com',
		isAdmin: true,
		clinicId: 'clinic-a',
	},
	regularUser: {
		_id: 'regular-user',
		email: 'regular-user@test.com',
		isAdmin: false,
		clinicId: 'clinic-a',
	},
};

describe('ClinicController authorization', () => {
	let app: INestApplication;
	const create = jest.fn();
	const updateClinicById = jest.fn();
	const deleteClinic = jest.fn();

	const tokenFor = (userId: keyof typeof users) =>
		jwt.sign({ id: userId }, process.env.SECRET as string, {
			expiresIn: '1h',
		});

	const postClinic = (token?: string) => {
		const httpRequest = request(app.getHttpServer()).post('/clinic');

		if (token) {
			httpRequest.set('Authorization', `Bearer ${token}`);
		}

		return httpRequest;
	};

	const putClinic = (clinicId: string, token?: string) => {
		const httpRequest = request(app.getHttpServer())
			.put(`/clinic/${clinicId}`)
			.send({ clinicName: 'Updated clinic' });

		if (token) {
			httpRequest.set('Authorization', `Bearer ${token}`);
		}

		return httpRequest;
	};

	const deleteClinicRequest = (clinicId: string, token?: string) => {
		const httpRequest = request(app.getHttpServer()).delete(
			`/clinic/${clinicId}`,
		);

		if (token) {
			httpRequest.set('Authorization', `Bearer ${token}`);
		}

		return httpRequest;
	};

	beforeAll(async () => {
		process.env.SECRET = 'test-secret';

		const moduleRef = await Test.createTestingModule({
			controllers: [ClinicController],
			providers: [
				JwtStrategy,
				{
					provide: UserRepository,
					useValue: {
						findUserById: jest.fn(async (id: string) => users[id] ?? null),
					},
				},
				{
					provide: ClinicService,
					useValue: { create, updateClinicById, delete: deleteClinic },
				},
			],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		create.mockReset();
		updateClinicById.mockReset();
		deleteClinic.mockReset();
		create.mockResolvedValue({ _id: 'new-clinic' });
		updateClinicById.mockResolvedValue({ _id: 'clinic-a' });
		deleteClinic.mockResolvedValue(undefined);
	});

	describe('POST /clinic', () => {
		it('returns 401 when there is no token', async () => {
			await postClinic().send({ clinicName: 'Clinic' }).expect(401);

			expect(create).not.toHaveBeenCalled();
		});

		it('returns 403 when the user is not an admin', async () => {
			await postClinic(tokenFor('regularUser'))
				.send({ clinicName: 'Clinic' })
				.expect(403);

			expect(create).not.toHaveBeenCalled();
		});

		it('returns 403 when a clinic admin tries to create a clinic', async () => {
			await postClinic(tokenFor('clinicAdminA'))
				.send({ clinicName: 'Clinic' })
				.expect(403);

			expect(create).not.toHaveBeenCalled();
		});

		it('allows a global admin to create a clinic', async () => {
			await postClinic(tokenFor('globalAdmin'))
				.send({ clinicName: 'Clinic' })
				.expect(201);

			expect(create).toHaveBeenCalledTimes(1);
		});
	});

	describe('PUT /clinic/:id', () => {
		it('returns 401 when there is no token', async () => {
			await putClinic('clinic-a').expect(401);

			expect(updateClinicById).not.toHaveBeenCalled();
		});

		it('returns 403 when a clinic admin targets another clinic', async () => {
			await putClinic('clinic-b', tokenFor('clinicAdminA')).expect(403);

			expect(updateClinicById).not.toHaveBeenCalled();
		});

		it('allows a clinic admin to update their own clinic', async () => {
			await putClinic('clinic-a', tokenFor('clinicAdminA')).expect(200);

			expect(updateClinicById).toHaveBeenCalledWith(
				'clinic-a',
				expect.objectContaining({ clinicName: 'Updated clinic' }),
			);
		});

		it('allows a global admin to update any clinic', async () => {
			await putClinic('clinic-b', tokenFor('globalAdmin')).expect(200);

			expect(updateClinicById).toHaveBeenCalledWith(
				'clinic-b',
				expect.objectContaining({ clinicName: 'Updated clinic' }),
			);
		});
	});

	describe('DELETE /clinic/:id', () => {
		it('returns 401 when there is no token', async () => {
			await deleteClinicRequest('clinic-a').expect(401);

			expect(deleteClinic).not.toHaveBeenCalled();
		});

		it('returns 403 when the user is not an admin', async () => {
			await deleteClinicRequest('clinic-a', tokenFor('regularUser')).expect(
				403,
			);

			expect(deleteClinic).not.toHaveBeenCalled();
		});

		it('returns 403 when a clinic admin targets another clinic', async () => {
			await deleteClinicRequest('clinic-b', tokenFor('clinicAdminA')).expect(
				403,
			);

			expect(deleteClinic).not.toHaveBeenCalled();
		});

		it('allows a clinic admin to delete their own clinic', async () => {
			await deleteClinicRequest('clinic-a', tokenFor('clinicAdminA')).expect(
				200,
			);

			expect(deleteClinic).toHaveBeenCalledWith('clinic-a');
		});

		it('allows a global admin to delete any clinic', async () => {
			await deleteClinicRequest('clinic-b', tokenFor('globalAdmin')).expect(
				200,
			);

			expect(deleteClinic).toHaveBeenCalledWith('clinic-b');
		});
	});
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { JwtStrategy } from '../../../auth/strategy/jwt.strategy';
import { UserRepository } from '../../../users/repository/user.repository';
import { CacheService } from '../cache.service';
import { CacheStrategiesEnum } from '../enum/CacheStrategies';
import { CacheController } from '../presentation/cache.controller';

const users = {
	'user-a': { _id: 'user-a', email: 'user-a@test.com', isAdmin: false },
	admin: { _id: 'admin', email: 'admin@test.com', isAdmin: true },
};

describe('POST /cache/clear', () => {
	let app: INestApplication;
	const clear = jest.fn();

	const tokenFor = (userId: keyof typeof users) =>
		jwt.sign({ id: userId }, process.env.SECRET as string, {
			expiresIn: '1h',
		});

	const clearCache = (token?: string) => {
		const httpRequest = request(app.getHttpServer()).post('/cache/clear');

		if (token) {
			httpRequest.set('Authorization', `Bearer ${token}`);
		}

		return httpRequest;
	};

	beforeAll(async () => {
		process.env.SECRET = 'test-secret';

		const moduleRef = await Test.createTestingModule({
			controllers: [CacheController],
			providers: [
				JwtStrategy,
				{
					provide: UserRepository,
					useValue: {
						findUserById: jest.fn(async (id: string) => users[id] ?? null),
					},
				},
				{
					provide: CacheService,
					useValue: { clear },
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
		clear.mockReset();
	});

	it('returns 401 when there is no token', async () => {
		await clearCache().expect(401);

		expect(clear).not.toHaveBeenCalled();
	});

	it('returns 401 when the token is invalid', async () => {
		await clearCache('not-a-valid-token').expect(401);

		expect(clear).not.toHaveBeenCalled();
	});

	it('returns 403 when the user is not an admin', async () => {
		await clearCache(tokenFor('user-a'))
			.query({ strategy: CacheStrategiesEnum.nodeCache })
			.expect(403);

		expect(clear).not.toHaveBeenCalled();
	});

	it('clears the cache when the user is an admin', async () => {
		await clearCache(tokenFor('admin'))
			.query({ strategy: CacheStrategiesEnum.nodeCache })
			.expect(200);

		expect(clear).toHaveBeenCalledTimes(1);
		expect(clear).toHaveBeenCalledWith(CacheStrategiesEnum.nodeCache);
	});
});

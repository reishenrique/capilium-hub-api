import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from '../guard/admin.guard';
import { Actor } from '../interfaces/actor.interface';

describe('AdminGuard', () => {
	const createContext = (user?: Partial<Actor>): ExecutionContext =>
		({
			switchToHttp: () => ({
				getRequest: () => ({ user }),
			}),
		}) as unknown as ExecutionContext;

	it('should allow an admin actor', () => {
		const guard = new AdminGuard();

		expect(
			guard.canActivate(createContext({ id: 'admin-id', isAdmin: true })),
		).toBe(true);
	});

	it('should forbid a non-admin actor', () => {
		const guard = new AdminGuard();

		expect(() =>
			guard.canActivate(createContext({ id: 'user-id', isAdmin: false })),
		).toThrow(ForbiddenException);
	});

	it('should forbid a request without an authenticated actor', () => {
		const guard = new AdminGuard();

		expect(() => guard.canActivate(createContext())).toThrow(
			ForbiddenException,
		);
	});
});

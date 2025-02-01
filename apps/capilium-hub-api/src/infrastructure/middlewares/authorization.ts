import {
	Injectable,
	Logger,
	NestMiddleware,
	UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
	private readonly logger = new Logger(AuthorizationMiddleware.name);

	use(req: Request, res: Response, next: NextFunction) {
		this.logger.log(`Incoming request: ${req.method} ${req.originalUrl}`);

		const secret = process.env.SECRET;

		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			this.logger.warn('Authorization token not provided or invalid');

			return next(
				new UnauthorizedException('Authentication Token not provided'),
			);
		}

		const token = authHeader.split(' ')[1];

		if (!token) {
			this.logger.warn('Token is missing after "Bearer"');

			return next(new UnauthorizedException('Token is missing after "Bearer"'));
		}

		try {
			const decodedToken = jwt.verify(token, secret || '');
			res.locals.token = decodedToken;

			next();
		} catch (error) {
			this.logger.error(`Token validation failed: ${error.message}`);
			next(new UnauthorizedException('Invalid or expired token'));
		}
	}
}

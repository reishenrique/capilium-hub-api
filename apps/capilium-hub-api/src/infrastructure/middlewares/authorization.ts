import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
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

			return res
				.status(401)
				.json({ message: 'Authentication Token not provided' });
		}

		const token = authHeader.split(' ')[1];

		if (!token) {
			this.logger.warn('Token is missing after "Bearer"');

			return res
				.status(401)
				.json({ message: 'Token is missing after "Bearer"' });
		}

		try {
			const decodedToken = jwt.verify(token, secret || '');
			res.locals.token = decodedToken;

			next();
		} catch (error) {
			this.logger.error(`Token validation failed: ${error.message}`);
			return res.status(401).json({ message: 'Invalid or expired token' });
		}
	}
}

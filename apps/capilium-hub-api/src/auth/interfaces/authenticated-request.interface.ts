import type { Request } from 'express';
import { Actor } from './actor.interface';

export interface AuthenticatedRequest extends Request {
	user: Actor & { email: string };
}

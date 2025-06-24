import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<string> {
		const now = Date.now();

		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();

		const { method, url } = request;

		return next.handle().pipe(
			tap(() => {
				const elapsed = Date.now() - now;
				const statusCode = response.statusCode;

				console.log(
					`[${method}] ${url} - Status Code: ${statusCode} - ${elapsed}ms`,
				);
			}),
		);
	}
}

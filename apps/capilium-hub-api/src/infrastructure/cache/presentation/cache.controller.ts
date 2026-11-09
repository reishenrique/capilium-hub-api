import {
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../../auth/guard/admin.guard';
import { JwtAuthGuard } from '../../../auth/guard/jwt.guard';
import { CacheService } from '../cache.service';
import { CacheStrategiesEnum } from '../enum/CacheStrategies';

@ApiTags('cache')
@Controller('cache')
export class CacheController {
	protected readonly _logger = new Logger(CacheController.name);
	constructor(private readonly cacheService: CacheService) {}

	@Post('/clear')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Clearing the application cache' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 401, description: 'Unauthenticated' })
	@ApiResponse({ status: 403, description: 'Only administrators allowed' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
	@UseGuards(JwtAuthGuard, AdminGuard)
	public async clearCache(@Query('strategy') strategy: CacheStrategiesEnum) {
		try {
			return await this.cacheService.clear(strategy);
		} catch (error) {
			this._logger.error(
				`Error attempting to clear the strategy cache: ${strategy}`,
			);
			throw new InternalServerErrorException(error);
		}
	}
}

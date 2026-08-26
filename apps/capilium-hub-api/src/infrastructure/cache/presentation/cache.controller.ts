import {
	Controller,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Logger,
	Post,
	Query,
} from '@nestjs/common';
import { CacheService } from '../cache.service';
import { CacheStrategiesEnum } from '../enum/CacheStrategies';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('cache')
@Controller('cache')
export class CacheController {
	protected readonly _logger = new Logger(CacheController.name);
	constructor(private readonly cacheService: CacheService) {}

	@Post('/clear')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Clearing the application cache' })
	@ApiResponse({ status: 200 })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
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

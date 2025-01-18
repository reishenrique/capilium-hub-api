import { BadRequestException, Controller, Post, Query } from '@nestjs/common';
import { CacheService } from '../cache.service';
import { CacheStrategiesEnum } from '../enum/CacheStrategies';

@Controller('cache')
export class CacheController {
	constructor(private readonly _cacheService: CacheService) {}

	@Post('/clear')
	public async clearCache(@Query('strategy') strategy: CacheStrategiesEnum) {
		try {
			return await this._cacheService.clearAllCacheValues(strategy);
		} catch (error) {
			throw new BadRequestException(error);
		}
	}
}

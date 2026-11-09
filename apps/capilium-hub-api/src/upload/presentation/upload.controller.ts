import {
	BadRequestException,
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { SelfOrAdminGuard } from '../../auth/guard/self-or-admin.guard';
import { LoggingInterceptor } from '../../common/interceptors/LoggingInterceptor';
import { resumeMulterOptions } from '../helpers/upload.helper';
import { ApiCreateUploadResume } from '../swagger/upload.swagger';
import { UploadService } from '../upload.service';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
	protected readonly _logger = new Logger(UploadController.name);
	constructor(private readonly uploadService: UploadService) {}

	@Post(':id/upload-resume')
	@HttpCode(HttpStatus.CREATED)
	@ApiCreateUploadResume()
	@UseInterceptors(
		FileInterceptor('file', resumeMulterOptions),
		LoggingInterceptor,
	)
	@UseGuards(JwtAuthGuard, SelfOrAdminGuard)
	public async uploadResume(
		@Param('id') userId: string,
		@UploadedFile() file?: Express.Multer.File,
	) {
		if (!file) {
			throw new BadRequestException('Resume file is required');
		}

		return await this.uploadService.attachResumeIntoUser(userId, file.filename);
	}
}

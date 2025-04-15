import {
	Controller,
	Logger,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { UploadService } from '../upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { multerStorage, pdfFileFilter } from '../helpers/upload.helper';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
	protected readonly _logger = new Logger(UploadController.name);
	constructor(private readonly uploadService: UploadService) {}

	@Post(':id/upload-resume')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: multerStorage,
			fileFilter: pdfFileFilter,
		}),
	)
	public async uploadResume(
		@Param('id') userId: string,
		@UploadedFile() file: Express.Multer.File,
	) {
		return await this.uploadService.attachResumeIntoUser(userId, file.filename);
	}
}

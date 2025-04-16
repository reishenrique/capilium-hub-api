import {
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { UploadService } from '../upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { multerStorage, pdfFileFilter } from '../helpers/upload.helper';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
	protected readonly _logger = new Logger(UploadController.name);
	constructor(private readonly uploadService: UploadService) {}

	@Post(':id/upload-resume')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Upload a pdf file and attach a user' })
	@ApiResponse({ status: 201 })
	@ApiResponse({ status: 404, description: 'User not found' })
	@ApiResponse({ status: 500, description: 'Internal Server Error' })
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

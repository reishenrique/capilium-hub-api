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
import { diskStorage } from 'multer';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
	protected readonly _logger = new Logger(UploadController.name);
	constructor(private readonly uploadService: UploadService) {}

	@Post(':id/upload-resume')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads/resumes',
				filename: (_req, file, cb) => {
					const uniqueName = `${Date.now()}-${file.originalname}`;
					cb(null, uniqueName);
				},
			}),
			fileFilter: (_req, file, cb) => {
				if (file.mimetype !== 'application/pdf') {
					return cb(new Error('Only PDFs are allowed'), false);
				}

				cb(null, true);
			},
		}),
	)
	public async uploadResume(
		@Param('id') userId: string,
		@UploadedFile() file: Express.Multer.File,
	) {
		return await this.uploadService.attachResume(userId, file.filename);
	}
}

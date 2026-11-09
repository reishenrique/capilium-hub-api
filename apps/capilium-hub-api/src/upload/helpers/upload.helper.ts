import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export const multerStorage = diskStorage({
	destination: './uploads/resumes',
	filename: (_req, file, cb) => {
		const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
		cb(null, uniqueName);
	},
});

export const MAX_RESUME_FILE_SIZE_BYTES =
	Number(process.env.MAX_RESUME_FILE_SIZE_BYTES) || 5 * 1024 * 1024;

export const pdfFileFilter = (_req, file, cb) => {
	if (file.mimetype !== 'application/pdf') {
		return cb(new BadRequestException('Only PDFs are allowed'), false);
	}

	cb(null, true);
};

export const resumeMulterOptions = {
	storage: multerStorage,
	fileFilter: pdfFileFilter,
	limits: {
		fileSize: MAX_RESUME_FILE_SIZE_BYTES,
		files: 1,
	},
};

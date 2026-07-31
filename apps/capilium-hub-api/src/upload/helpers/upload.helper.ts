import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

export const multerStorage = diskStorage({
	destination: './uploads/resumes',
	filename: (_req, file, cb) => {
		const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
		cb(null, uniqueName);
	},
});

export const pdfFileFilter = (_req, file, cb) => {
	if (file.mimetype !== 'application/pdf') {
		return cb(new BadRequestException('Only PDFs are allowed'), false);
	}

	cb(null, true);
};

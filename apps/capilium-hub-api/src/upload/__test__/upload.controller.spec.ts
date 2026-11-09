import { existsSync, readdirSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { JwtStrategy } from '../../auth/strategy/jwt.strategy';
import { UserRepository } from '../../users/repository/user.repository';
import { MAX_RESUME_FILE_SIZE_BYTES } from '../helpers/upload.helper';
import { UploadController } from '../presentation/upload.controller';
import { UploadService } from '../upload.service';

const RESUME_DIR = resolve('./uploads/resumes');
const PDF_BUFFER = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');

const users = {
	'user-a': { _id: 'user-a', email: 'user-a@test.com', isAdmin: false },
	'user-b': { _id: 'user-b', email: 'user-b@test.com', isAdmin: false },
	admin: { _id: 'admin', email: 'admin@test.com', isAdmin: true },
};

describe('POST /upload/:id/upload-resume', () => {
	let app: INestApplication;
	let filesBefore: string[];
	const attachResumeIntoUser = jest.fn();

	const tokenFor = (userId: keyof typeof users) =>
		jwt.sign({ id: userId }, process.env.SECRET as string, {
			expiresIn: '1h',
		});

	const upload = (userId: string, token?: string) => {
		const httpRequest = request(app.getHttpServer()).post(
			`/upload/${userId}/upload-resume`,
		);

		if (token) {
			httpRequest.set('Authorization', `Bearer ${token}`);
		}

		return httpRequest;
	};

	beforeAll(async () => {
		process.env.SECRET = 'test-secret';

		const moduleRef = await Test.createTestingModule({
			controllers: [UploadController],
			providers: [
				JwtStrategy,
				{
					provide: UserRepository,
					useValue: {
						findUserById: jest.fn(async (id: string) => users[id] ?? null),
					},
				},
				{
					provide: UploadService,
					useValue: { attachResumeIntoUser },
				},
			],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		filesBefore = existsSync(RESUME_DIR) ? readdirSync(RESUME_DIR) : [];
		attachResumeIntoUser.mockReset();
		attachResumeIntoUser.mockResolvedValue({
			message: 'Resume uploaded successfully',
			filename: 'resume.pdf',
		});
	});

	afterEach(() => {
		const filesAfter = existsSync(RESUME_DIR) ? readdirSync(RESUME_DIR) : [];

		for (const file of filesAfter) {
			if (!filesBefore.includes(file)) {
				unlinkSync(join(RESUME_DIR, file));
			}
		}
	});

	it('returns 401 when there is no token', async () => {
		await upload('user-a')
			.attach('file', PDF_BUFFER, {
				filename: 'resume.pdf',
				contentType: 'application/pdf',
			})
			.expect(401);

		expect(attachResumeIntoUser).not.toHaveBeenCalled();
		expect(readdirSync(RESUME_DIR)).toEqual(filesBefore);
	});

	it('returns 403 when a user targets another user', async () => {
		await upload('user-b', tokenFor('user-a'))
			.attach('file', PDF_BUFFER, {
				filename: 'resume.pdf',
				contentType: 'application/pdf',
			})
			.expect(403);

		expect(attachResumeIntoUser).not.toHaveBeenCalled();
		expect(readdirSync(RESUME_DIR)).toEqual(filesBefore);
	});

	it('attaches the resume to the authenticated user', async () => {
		await upload('user-a', tokenFor('user-a'))
			.attach('file', PDF_BUFFER, {
				filename: 'resume.pdf',
				contentType: 'application/pdf',
			})
			.expect(201);

		expect(attachResumeIntoUser).toHaveBeenCalledWith(
			'user-a',
			expect.stringMatching(/\.pdf$/),
		);
	});

	it('allows an admin to attach a resume to another user', async () => {
		await upload('user-b', tokenFor('admin'))
			.attach('file', PDF_BUFFER, {
				filename: 'resume.pdf',
				contentType: 'application/pdf',
			})
			.expect(201);

		expect(attachResumeIntoUser).toHaveBeenCalledWith(
			'user-b',
			expect.stringMatching(/\.pdf$/),
		);
	});

	it('returns 400 when the file is not a PDF', async () => {
		await upload('user-a', tokenFor('user-a'))
			.attach('file', Buffer.from('not a pdf'), {
				filename: 'resume.txt',
				contentType: 'text/plain',
			})
			.expect(400);

		expect(attachResumeIntoUser).not.toHaveBeenCalled();
	});

	it('returns 400 when the file is missing', async () => {
		await upload('user-a', tokenFor('user-a')).expect(400);

		expect(attachResumeIntoUser).not.toHaveBeenCalled();
	});

	it('returns 413 and persists nothing when the file exceeds the limit', async () => {
		const oversizedFile = Buffer.alloc(MAX_RESUME_FILE_SIZE_BYTES + 1, 0x20);

		await upload('user-a', tokenFor('user-a'))
			.attach('file', oversizedFile, {
				filename: 'resume.pdf',
				contentType: 'application/pdf',
			})
			.expect(413);

		expect(attachResumeIntoUser).not.toHaveBeenCalled();
		expect(readdirSync(RESUME_DIR)).toEqual(filesBefore);
	});
});

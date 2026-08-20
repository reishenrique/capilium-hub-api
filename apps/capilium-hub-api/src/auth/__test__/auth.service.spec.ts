import {
	UnauthorizedException,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { createUserEntityMock } from '../../common/factories/user.factory';
import { UserRepository } from '../../users/repository/user.repository';
import { AuthService } from '../auth.service';
import bcrypt from 'bcrypt';
import * as tokenHelper from '../../common/helpers/jwt.helper';
import EventEmitter2 from 'eventemitter2';

describe('AuthService', () => {
	let authService: AuthService;
	let userRepository: jest.Mocked<UserRepository>;

	const mockUser = createUserEntityMock({
		email: 'johndoe@test.com',
		password: '$2b$10$hashedpassword',
	} as any);

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UserRepository,
					useValue: {
						findUserByEmail: jest.fn(),
					},
				},
				{
					provide: EventEmitter2,
					useValue: {
						emit: jest.fn(),
					},
				},
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
		userRepository = module.get(UserRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('login', () => {
		it('should return token and success message when credentials are valid', async () => {
			userRepository.findUserByEmail.mockResolvedValue(mockUser as any);
			jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true as never);
			jest
				.spyOn(tokenHelper, 'generateAccessToken')
				.mockReturnValue('mock-token');

			const result = await authService.login({
				email: 'johndoe@test.com',
				password: '123@Test',
			});

			expect(result).toEqual({
				message: 'Login successful!',
				token: 'mock-token',
			});
		});

		it('should throw UnauthorizedException when user is not found', async () => {
			userRepository.findUserByEmail.mockResolvedValue(null);

			await expect(
				authService.login({ email: 'notfound@test.com', password: '123@Test' }),
			).rejects.toThrow(UnauthorizedException);
		});

		it('should throw UnauthorizedException when password is invalid', async () => {
			userRepository.findUserByEmail.mockResolvedValue(mockUser as any);
			jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false as never);

			await expect(
				authService.login({
					email: 'johndoe@test.com',
					password: 'wrong-password',
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it('should call findUserByEmail with the correct email', async () => {
			userRepository.findUserByEmail.mockResolvedValue(null);

			await authService
				.login({ email: 'johndoe@test.com', password: '123@Test' })
				.catch(() => {});

			expect(userRepository.findUserByEmail).toHaveBeenCalledWith(
				'johndoe@test.com',
			);
		});

		it('should not generate token when user is not found', async () => {
			userRepository.findUserByEmail.mockResolvedValue(null);
			const generateTokenSpy = jest.spyOn(tokenHelper, 'generateAccessToken');

			await authService
				.login({ email: 'notfound@test.com', password: '123@Test' })
				.catch(() => {});

			expect(generateTokenSpy).not.toHaveBeenCalled();
		});
	});

	describe('refreshToken', () => {
		it('should return new token and success message when credentials are valid', async () => {
			userRepository.findUserByEmail.mockResolvedValue(mockUser as any);
			jest
				.spyOn(tokenHelper, 'refreshAccessToken')
				.mockReturnValue('new-mock-token');

			const result = await authService.refreshToken({
				email: 'johndoe@test.com',
				refreshToken: 'valid-refresh-token',
			});

			expect(result).toEqual({
				message: 'Access token updated successfully',
				token: 'new-mock-token',
			});
		});

		it('should throw BadRequestException when email is missing', async () => {
			await expect(
				authService.refreshToken({
					email: '',
					refreshToken: 'valid-refresh-token',
				}),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException when refreshToken is missing', async () => {
			await expect(
				authService.refreshToken({
					email: 'johndoe@test.com',
					refreshToken: '',
				}),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw NotFoundException when user is not found', async () => {
			userRepository.findUserByEmail.mockResolvedValue(null);

			await expect(
				authService.refreshToken({
					email: 'notfound@test.com',
					refreshToken: 'valid-refresh-token',
				}),
			).rejects.toThrow(NotFoundException);
		});

		it('should call findUserByEmail with the correct email', async () => {
			userRepository.findUserByEmail.mockResolvedValue(mockUser as any);
			jest
				.spyOn(tokenHelper, 'refreshAccessToken')
				.mockReturnValue('new-mock-token');

			await authService.refreshToken({
				email: 'johndoe@test.com',
				refreshToken: 'valid-refresh-token',
			});

			expect(userRepository.findUserByEmail).toHaveBeenCalledWith(
				'johndoe@test.com',
			);
		});

		it('should call refreshAccessToken with correct refreshToken and email', async () => {
			userRepository.findUserByEmail.mockResolvedValue(mockUser as any);
			const refreshSpy = jest
				.spyOn(tokenHelper, 'refreshAccessToken')
				.mockReturnValue('new-mock-token');

			await authService.refreshToken({
				email: 'johndoe@test.com',
				refreshToken: 'valid-refresh-token',
			});

			expect(refreshSpy).toHaveBeenCalledWith(
				'valid-refresh-token',
				'johndoe@test.com',
			);
		});
	});
});

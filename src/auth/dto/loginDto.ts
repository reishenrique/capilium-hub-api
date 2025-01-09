import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	@ApiProperty({ example: 'johndoe@test.com', description: 'User email' })
	@IsNotEmpty({ message: 'The user email is required' })
	@IsEmail()
	email: string;

	@ApiProperty({ example: '123@Test', description: 'User password' })
	@IsNotEmpty({ message: 'The user password is required' })
	@IsString()
	password: string;
}

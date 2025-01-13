import { UserEntity } from '../entity/users.entity';

export interface IUserRepository {
	createUser(newUser: UserEntity): Promise<UserEntity>;
	getUserById(id: string): Promise<UserEntity>;
	getUserByCpf(cpf: string): Promise<UserEntity>;
	getUserByEmail(email: string): Promise<UserEntity>;
	deleteUserById(id: string): Promise<UserEntity>;
	findUserByIdAndUpdate(id: string, newUserData: object): Promise<UserEntity>;
}

import { UserEntity } from '../entity/users.entity';

export interface IUserRepository {
	createUser(newUser: UserEntity);
	getUserById(id: string);
	getUserByCpf(cpf: string);
	getUserByEmail(email: string);
	deleteUserById(id: string);
	findUserByIdAndUpdate(id: string, newUserData: object);
}

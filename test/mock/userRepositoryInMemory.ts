import { UserEntity } from 'src/users/entity/users.entity';
import { IUserRepository } from 'src/users/interfaces/IUserRepository';

export class UserRepositoryInMemory implements IUserRepository {
	private users: any[] = [];
	constructor(users: any) {
		this.users = users ?? [];
	}

	async createUser(newUser: UserEntity) {
		this.users.push(newUser);
	}

	async getUserById(id: string) {
		const user = this.users.find((user) => user._id === id);
		return user;
	}

	async getUserByCpf(cpf: string) {
		const user = this.users.find((user) => user.cpf === cpf);
		return user;
	}

	async getUserByEmail(email: string) {
		const user = this.users.find((user) => user.email === email);
		return user;
	}

	async deleteUserById(id: string) {
		const userIndex = this.users.findIndex((user) => user._id === id);
        if (userIndex !== -1) {
            const deletedUser = this.users.splice(userIndex, 1)[0]
            return deletedUser
        }

        return null
	}

    async findUserByIdAndUpdate(id: string, newUserData: object) {
        const userIndex = this.users.findIndex((user) => user._id === id)
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...newUserData }
            return this.users[userIndex]
        }

        return null
    }
}

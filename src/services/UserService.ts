import { UserData } from "../types"
import { User } from "../entity/User"
import { Repository } from "typeorm"
import createHttpError from "http-errors"
import { Roles } from "../constants"

export class UserService {

    constructor(private userRepository: Repository<User>) { }

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            const user = await this.userRepository.save({ firstName, lastName, email, password, role: Roles.CUSTOMER })
            return user
        } catch (error) {
            const err = createHttpError(500, 'Failed to store data in db')
            throw err
        }
    }
}
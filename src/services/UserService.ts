import { UserData } from "../types"
import { User } from "../entity/User"
import { Repository } from "typeorm"
import createHttpError from "http-errors"
import { Roles } from "../constants"
import bcrypt from 'bcrypt'

export class UserService {

    constructor(private userRepository: Repository<User>) { }

    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } })
        if (user) {
            const err = createHttpError(400, 'Email is already exists')
            throw err
        }

        // hash password
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        try {
            const user = await this.userRepository.save({ firstName, lastName, email, password: hashedPassword, role: Roles.CUSTOMER })
            return user
        } catch (error) {
            const err = createHttpError(500, 'Failed to store data in db')
            throw err
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } })
    }

    async findById(id: number) {
        return await this.userRepository.findOne({ where: { id } })
    }
}
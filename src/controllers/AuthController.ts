import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class AuthController {

    constructor(private userService: UserService, private logger: Logger) { }

    async register(req: Request, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body
        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
        }
        this.logger.debug('New request to register a user', { firstName, lastName, email, password: '****' })
        try {
            const user = await this.userService.create({ firstName, lastName, email, password })
            this.logger.info('User has been registered', { id: user.id })
            res.status(201).json({ id: user.id })
        } catch (error) {
            next(error)
        }
    }
}
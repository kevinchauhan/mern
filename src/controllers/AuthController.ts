import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class AuthController {
    userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }

    async register(req: Request, res: Response) {
        const { firstName, lastName, email, password } = req.body
        const id = await this.userService.create({ firstName, lastName, email, password })
        res.status(201).json({ id })
    }
}
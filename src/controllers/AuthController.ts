import fs from 'fs'
import path from 'path'
import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from 'http-errors';
import { CONFIG } from '../config';

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

            let privateKey: Buffer
            try {
                privateKey = fs.readFileSync(path.join(__dirname, '../../certs/private.pem'))
            } catch (error) {
                const err = createHttpError(500, 'Error while reading private key')
                throw err
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role
            }
            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service'
            })
            const refreshToken = sign(payload, CONFIG.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service'
            })

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1hr
                httpOnly: true //very important
            })
            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
                httpOnly: true //very important
            })

            res.status(201).json({ id: user.id })
        } catch (error) {
            next(error)
        }
    }
}
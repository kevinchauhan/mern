import { NextFunction, Response } from "express";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { UserRequest } from '../types';
import { TokenService } from '../services/TokenService';

export class AuthController {

    constructor(private userService: UserService, private logger: Logger, private tokenService: TokenService) { }

    async register(req: UserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body
        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
        }
        this.logger.debug('New request to register a user', { firstName, lastName, email, password: '****' })
        try {
            const user = await this.userService.create({ firstName, lastName, email, password })
            this.logger.info('User has been registered', { id: user.id })

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            // persist refreshtoken
            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365
            const refreshTokenRepository = AppDataSource.getRepository(RefreshToken)
            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR)
            })

            const refreshToken = this.tokenService.generateRefreshToken({ ...payload, id: newRefreshToken.id })

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
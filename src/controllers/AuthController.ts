import { NextFunction, Response } from "express";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { AuthRequest, UserRequest } from '../types';
import { TokenService } from '../services/TokenService';
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { Roles } from "../constants";

export class AuthController {

    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService
    ) { }

    async register(req: UserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password } = req.body

        // validation
        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
        }

        this.logger.debug('New request to register a user', { firstName, lastName, email, password: '****' })

        try {
            // persists user
            const user = await this.userService.create({ firstName, lastName, email, password, role: Roles.CUSTOMER })

            this.logger.info('User has been registered', { id: user.id })

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            // persist refresh token
            const newRefreshToken = await this.tokenService.persistsRefreshToken(user)

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

    async login(req: UserRequest, res: Response, next: NextFunction) {
        const { email, password } = req.body

        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
        }
        this.logger.debug('New request to login a user', { email, password: '****' })

        try {
            // check email esists
            // check password
            // generate tokens 
            // add tokens to cookies
            // return response {id}

            const user = await this.userService.findByEmail(email)
            if (!user) {
                const err = createHttpError(401, 'Invalid credentials')
                return next(err)
            }

            const isPasswordMatched = await this.credentialService.comparePassword(password, user.password)
            if (!isPasswordMatched) {
                const err = createHttpError(401, 'Invalid credentials')
                return next(err)
            }

            this.logger.info('User has been logged in', { id: user.id })

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            // persist refresh token
            const newRefreshToken = await this.tokenService.persistsRefreshToken(user)

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

            res.status(200).json({ id: user.id })
        } catch (error) {
            next(error)
        }


    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findById(Number(req.auth.sub))
            res.json({ ...user, password: undefined })
        } catch (error) {
            const err = createHttpError(500, 'Error while getting user')
            return next(err)
        }
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.sub
            }
            const accessToken = this.tokenService.generateAccessToken(payload)

            const user = await this.userService.findById(Number(req.auth.sub))
            if (!user) {
                const err = createHttpError(400, 'User with the token could not find')
                return next(err)
            }
            // persist refresh token
            const newRefreshToken = await this.tokenService.persistsRefreshToken(user)

            // delete old token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id))

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

            res.status(200).json({ id: user.id })
        } catch (error) {
            next(error)
        }

    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id))
            this.logger.info('Refresh token has been loggedout', { id: req.auth.id })
            this.logger.info('User has been logged out', { id: req.auth.sub })

            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')

            res.json({})
        } catch (error) {
            return next(error)
        }
    }
}
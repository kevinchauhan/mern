import { AuthController } from '../controllers/AuthController'
import express, { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import logger from '../config/logger'
import registerValidator from '../validators/registerValidator'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const authController = new AuthController(userService, logger)

router.post('/register', registerValidator, (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next))

export default router
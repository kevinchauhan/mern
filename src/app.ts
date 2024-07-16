import "reflect-metadata"
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import authRouter from './routes/auth'
import cookieParser from "cookie-parser"
import { CONFIG } from "./config"
import tenantRouter from "./routes/tenant"

const app = express()
app.use(cors({
    origin: [CONFIG.CORS_URL || ''],
    credentials: true
}))
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// Routes
app.get('/', async (req, res) => {
    res.send('Welcome to Docker...')
})

// Auth Route 
app.use('/auth', authRouter)
// Tenant Route
app.use('/tenant', tenantRouter)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || err.status || 500
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    })
})

export default app

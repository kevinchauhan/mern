import { DataSource } from "typeorm"
import { AppDataSource } from "../../src/config/data-source"
import app from "../../src/app"
import request from "supertest"
import { isJwt } from "../utils"

describe('POST /auth/login', () => {
    let connection: DataSource

    beforeAll(async () => {
        // databse connection
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // drop and syncronize databse
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        // close databse connection
        await AppDataSource.destroy()
    })

    describe('All fields are given', () => {
        it('should return 200 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            const loginData = {
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            // Act
            await request(app).post('/auth/register').send(userData)
            const response = await request(app).post('/auth/login').send(loginData)
            // Assert
            expect(response.statusCode).toBe(200)
        })
        it('should return accessToken and refreshToken in cookie', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            const loginData = {
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            await request(app).post('/auth/register').send(userData)
            const response = await request(app).post('/auth/login').send(loginData)
            interface Headers {
                ['set-cookie']: string[]
            }
            const cookies = (response.headers as Headers)['set-cookie'] || []
            let accessToken = null, refreshToken = null
            cookies.forEach(cookie => {
                if (cookie.startsWith('accessToken')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }
                if (cookie.startsWith('refreshToken')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            });
            expect(accessToken).not.toBeNull()
            expect(refreshToken).not.toBeNull()
            expect(isJwt(accessToken)).toBeTruthy()
            expect(isJwt(refreshToken)).toBeTruthy()
        })
        it('should return 400 status code if emial or password does not match', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevinchauhan@gmail.com',
                password: '1234578'
            }
            const loginData = {
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            await request(app).post('/auth/register').send(userData)
            const response = await request(app).post('/auth/login').send(loginData)
            expect(response.statusCode).toBe(401)
        })
        it('should not return accessToken and refreshToken if email or passwrod does not match', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevinchauhan@gmail.com',
                password: '1278'
            }
            const loginData = {
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            await request(app).post('/auth/register').send(userData)
            const response = await request(app).post('/auth/login').send(loginData)
            interface Headers {
                ['set-cookie']: string[]
            }
            const cookies = (response.headers as Headers)['set-cookie'] || []
            let accessToken = null, refreshToken = null
            cookies.forEach(cookie => {
                if (cookie.startsWith('accessToken')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }
                if (cookie.startsWith('refreshToken')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            });
            expect(accessToken).toBeNull()
            expect(refreshToken).toBeNull()
        })
    })

    describe('fields are missing', () => {
        it('should return 400 status code if any one/all fields are missing', async () => {
            const userData = {
                email: ' ',
                password: ' ',
            }
            const response = await request(app).post('/auth/login').send(userData)
            expect(response.statusCode).toBe(400)
        })
    })

})
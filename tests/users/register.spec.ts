import app from "../../src/app"
import request from "supertest"
import { DataSource } from "typeorm"
import { User } from "../../src/entity/User"
import { AppDataSource } from "../../src/config/data-source"
import { Roles } from "../../src/constants"
import { isJwt } from "../utils"
import { RefreshToken } from "../../src/entity/RefreshToken"

describe('POST /auth/register', () => {
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

    describe('all fields are given', () => {
        it('should return 201 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            // Act
            const response = await request(app).post('/auth/register').send(userData)
            // Assert
            expect(response.statusCode).toBe(201)
        })
        it('should return valid json response', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            const response = await request(app).post('/auth/register').send(userData)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        })
        it('should persist user in the databse', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(1)
            expect(users[0].firstName).toEqual(userData.firstName)
            expect(users[0].lastName).toEqual(userData.lastName)
            expect(users[0].email).toEqual(userData.email)
        })
        it('should return the id of created user', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            const response = await request(app).post('/auth/register').send(userData)
            expect(response.body).toHaveProperty('id')
        })
        it('should assaign a customer role', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })
        it('should store the hashed password in db', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678'
            }
            await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].password).toHaveLength(60)
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
        })
        it('should return 400 status code if email already exists', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678',
                role: Roles.CUSTOMER
            }
            const userRepository = connection.getRepository(User)
            await userRepository.save(userData)
            const response = await request(app).post('/auth/register').send(userData)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(1)
        })
        it('should return accessToken and refreshToken in cookie', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678',
                role: Roles.CUSTOMER
            }
            const response = await request(app).post('/auth/register').send(userData)
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
        it('should persist refresh token in db', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '12345678',
                role: Roles.CUSTOMER
            }
            const response = await request(app).post('/auth/register').send(userData)
            const refreshTokenRepository = connection.getRepository(RefreshToken)
            const refreshTokens = await refreshTokenRepository.find()
            const tokens = await refreshTokenRepository.createQueryBuilder('refreshToken').where('refreshToken.userId = :userId', { userId: (response.body as Record<string, string>).id }).getMany()
            expect(refreshTokens).toHaveLength(1)
            expect(tokens).toHaveLength(1)
        })
    })

    describe('fields are missing', () => {
        it('should return 400 status code if any one/all fields are missing', async () => {
            const userData = {
                firstName: ' ',
                lastName: ' ',
                email: ' ',
                password: ' ',
                role: Roles.CUSTOMER
            }
            const response = await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
    })

    describe('fields are not in proper format', () => {
        it('should trim the all fields', async () => {
            const userData = {
                firstName: ' Kevin ',
                lastName: ' Chauhan ',
                email: ' kevin@gmail.com ',
                password: '12345678',
                role: Roles.CUSTOMER
            }
            await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0].firstName).toBe('Kevin')
            expect(users[0].lastName).toBe('Chauhan')
            expect(users[0].email).toBe('kevin@gmail.com')
        })
        it('should return 400 status code 400 if email is not a valid email', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevingmailcom',
                password: '12345678'
            }
            const response = await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code 400 if password length is less than 8 chars', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '1234'
            }
            const response = await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
    })
})
import app from "../../src/app"
import request from "supertest"
import { DataSource } from "typeorm"
import { User } from "../../src/entity/User"
import { AppDataSource } from "../../src/config/data-source"
import { Roles } from "../../src/constants"

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
                password: '123'
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
                password: '123'
            }
            const response = await request(app).post('/auth/register').send(userData)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        })
        it('should persist user in the databse', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '123'
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
                password: '123'
            }
            const response = await request(app).post('/auth/register').send(userData)
            expect(response.body).toHaveProperty('id')
        })
        it('should assaign a customer role', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '123'
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
                password: '123'
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
                password: '123',
                role: Roles.CUSTOMER
            }
            const userRepository = connection.getRepository(User)
            await userRepository.save(userData)
            const response = await request(app).post('/auth/register').send(userData)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(1)
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
                password: '123',
                role: Roles.CUSTOMER
            }
            await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0].firstName).toBe('Kevin')
            expect(users[0].lastName).toBe('Chauhan')
            expect(users[0].email).toBe('kevin@gmail.com')
        })
        it('should return 400 status code 400 if emial is not a valid email', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevingmailcom',
                password: '123'
            }
            const response = await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
    })
})
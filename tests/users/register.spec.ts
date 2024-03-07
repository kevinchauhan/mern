import app from "../../src/app"
import request from "supertest"
import { DataSource } from "typeorm"
import { User } from "../../src/entity/User"
import { AppDataSource } from "../../src/config/data-source"
import { truncateTable } from "../utils"

describe('POST /auth/register', () => {
    let connection: DataSource

    beforeAll(async () => {
        // databse connection
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // truncate databse
        await truncateTable(connection)
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
        it('should should return the id of created user', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevin@gmail.com',
                password: '123'
            }
            const response = await request(app).post('/auth/register').send(userData)
            expect(response.body).toHaveProperty('id')
        })
    })

    // eslint-disable-next-line
    describe('fields are missing', () => { })
})
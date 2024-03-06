import app from "../../src/app"
import request from "supertest"

describe('POST /auth/register', () => {
    describe('all fields are given', () => {
        it('should return 201 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
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
                password: '123'
            }
            const response = await request(app).post('/auth/register').send(userData)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))
        })
        it('should persist user in the databse', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                password: '123'
            }
            await request(app).post('/auth/register').send(userData)
        })
    })
    // eslint-disable-next-line
    describe('fields are missing', () => { })
})
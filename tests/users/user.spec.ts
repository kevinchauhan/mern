import { DataSource } from "typeorm"
import { AppDataSource } from "../../src/config/data-source"
import app from "../../src/app"
import request from "supertest"
import createJWKSMock from 'mock-jwks'
import { User } from "../../src/entity/User"
import { Roles } from "../../src/constants"

describe('GET /auth/self', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>

    beforeAll(async () => {
        // jwks mock server
        jwks = createJWKSMock('http://localhost:5501')
        // databse connection
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        // drop and syncronize databse
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterEach(async () => {
        jwks.stop()
    })

    afterAll(async () => {
        // close databse connection
        await AppDataSource.destroy()
    })

    describe('All fields are given', () => {
        it('should return 200 status code', async () => {
            const accessToken = jwks.token({ sub: '1', role: Roles.CUSTOMER })
            const response = await request(app).get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send()
            expect(response.statusCode).toBe(200)
        })
        it('should return the user data', async () => {
            const userData = {
                firstName: 'Kevin',
                lastName: 'Chauhan',
                email: 'kevinchauhan@gmail.com',
                password: '1234578',
                role: Roles.CUSTOMER
            }
            const userRepository = connection.getRepository(User)
            const data = await userRepository.save(userData)
            const accessToken = jwks.token({ sub: String(data.id), role: data.role })

            const response = await request(app).get('/auth/self').set('Cookie', [`accessToken=${accessToken};`]).send()
            expect(response.body.id).toBe(data.id)
        })
    })


})
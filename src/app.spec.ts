import app from './app'
import { calDis } from './utils'
import request from 'supertest'

describe.skip('App', () => {
    it('should cal discount', () => {
        const result = calDis(100, 10)
        expect(result).toBe(10)
    })
    it('should return 200 status', async () => {
        const response = await request(app).get('/').send()
        expect(response.statusCode).toBe(200)
    })
})

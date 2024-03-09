import { CONFIG } from './config'
import app from './app'
import logger from './config/logger'
import { AppDataSource } from './config/data-source'

const PORT = CONFIG.PORT || 8000

const startServer = async (port: number) => {
    try {

        await AppDataSource.initialize()
        logger.info('Database connected successfully')

        app.listen(port, () => {
            logger.info(`Listening on port ${port}`)
        })

    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`something went wrong..`, error.message)
            setTimeout(() => {
                process.exit(1)
            }, 1000)
        }
    }
}

startServer(PORT as number)

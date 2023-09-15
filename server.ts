import { CONFIG } from './src/config'
import app from './src/app'

const PORT = CONFIG.PORT || 8000

const startServer = async (port: number) => {
    try {
        app.listen(port, () => {
            // console.log(`Listening on port ${port}`)
        })
    } catch (error: unknown) {
        // console.log(`something went wrong..`, error)
    }
}

startServer(PORT as number)

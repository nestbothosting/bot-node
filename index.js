const express = require('express')
const Check_API_KEY = require('./api_key')
const cors = require('cors')
require('./mongodb/db')

const app = express()

app.use(Check_API_KEY)
app.use(express.json())
app.use(cors())

const IndexRouter = require('./router/index')
const BotRouter = require('./router/bot')

app.use('/', IndexRouter)
app.use('/bot', BotRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server Running! on Port: ${PORT}`))
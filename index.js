const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const PORT = process.env.PORT || 5050
const userRoute = require('./Routes/users')
const subscriptionRoute = require('./Routes/subscriptions')

app.use(cors())
app.use(express.json())

//Routes

app.use('/', userRoute )
app.use('/subscription', subscriptionRoute )

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
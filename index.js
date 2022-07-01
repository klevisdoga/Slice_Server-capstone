const express = require('express')
const app = express()
const cors = require('cors')
const userRoute = require('./Routes/users')
const accessRoute = require('./Routes/access')
require('dotenv').config()
const PORT = process.env.PORT || 5050

//

//

app.use(cors())
app.use(express.json())

//Routes

app.use('/', userRoute )
app.use('/access', accessRoute)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const {errorHandler,tokenHandler,userHandler} = require('./utils/middleware')
const blogRoutes = require('./controllers/blogRoutes')
const userRoutes = require('./controllers/usersRoutes')
const loginRoutes = require('./controllers/loginRoutes')


const mongoUrl = config.MongoURL
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())
app.use(tokenHandler)
app.use('/api/blogs',blogRoutes)
app.use('/api/users',userRoutes)
app.use('/api/login',loginRoutes)
app.use(errorHandler) // has to be the last loaded middleware
module.exports = app
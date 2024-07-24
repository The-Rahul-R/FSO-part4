const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.post('/', async (request,response,next) => {
    const {name,username,password} = request.body
    if (!name || !username || !password) {
        return response.status(400).send("Bad request") // returning here is important
    }
    if (password.length<3) {
        return response.status(400).send('password is less than 3 characters')
    }
    const saltrounds = 10
    const passwordHash = await bcrypt.hash(password,saltrounds)

    const user = new User({
        name,
        username,
        passwordHash, //use hash while storing in the database
    })

    const savedUser = await user.save().catch(error => next(error))
    response.status(201).json(savedUser)
})

usersRouter.get('/',async (request,response) => {
    const users = await User.find({}).populate('blogs',{title:1,author:1,url:1,likes:1})
    response.json(users)
})

module.exports = usersRouter
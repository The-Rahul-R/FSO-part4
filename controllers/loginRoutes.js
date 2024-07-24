const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')

loginRouter.post('/', async (request,response) =>{
    const {username,password} = request.body
    const user = await User.findOne({username})
    const correctPassword = user === null? false :await bcrypt.compare(password,user.passwordHash)

    if(!(user && correctPassword)){
       return response.status(401).json({error:'incorrect username or password'}) //if you forget return here u will face issues
    }

    const userForToken = {
        username:user.username,
        id: user._id
    }

    const token = jwt.sign(userForToken,process.env.SECRET)

    response
        .status(200)
        .json({token,username:user.username,name:user.name})
})

module.exports = loginRouter
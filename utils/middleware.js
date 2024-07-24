const jwt = require('jsonwebtoken')

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
      return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name ===  'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' })
    }
  
    next(error)
  }

const tokenHandler = (request,response,next) => {
  const authorization = request.get('authorization')
  if(authorization && authorization.startsWith('Bearer')) {
    request.token = authorization.replace('Bearer ','') //you had forgotten a space here
  }else {
    request.token = null
  }
  next()
}

const userHandler = (request,response,next) => {
  const decodedToken = jwt.verify(request.token,process.env.SECRET)
  if(decodedToken.id){
    request.user = decodedToken.id
  }else {
    request.user = null
  }
  next()
}


module.exports = {errorHandler,tokenHandler,userHandler}
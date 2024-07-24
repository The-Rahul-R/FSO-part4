const blogRoutes = require('express').Router()
const Blog = require('../models/BlogModel')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const {userHandler} = require('../utils/middleware')

// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if(authorization && authorization.startsWith('Bearer')) {
//     return authorization.replace('Bearer ','') //you had forgotten a space here
//   }
//   return null
// }

blogRoutes.get('/', async (request, response) => {
    try {
      const result = await Blog.find({}).populate('user',{username:1,name:1})
      return response.status(200).json(result)
    }
    catch {
      return response.status(500).json({error: 'something went wrong'})
    }
  })

blogRoutes.get('/:id', async (request,response) => {
  try {
    const result = await Blog.findById(request.params.id)
    if(result){
      response.status(200).json(result)
    } else {
      response.status(404).end()
    }
  } catch (err) {
    response.status(500).json({error: err.message})
  }
})  
  
blogRoutes.post('/',userHandler,async (request, response,next) => {
  const {title,url} = request.body
  if(!request.token) {
    return response.send('provide jwt')
  }

  try {
    const userid = request.user
    console.log('the user is=',userid) //exe-4.22
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    console.log('decoded=',decodedToken)

    if(!decodedToken.id){
      return response.status(401).json({error:'invalid token'})
    }
    if (!title || !url) {
      return response.status(400).send("Bad request")
    }
    const user = await User.findById(decodedToken.id).catch(error => next(error))
    console.log('user=',user)
    const blog = new Blog({
      ...request.body,
      user: user._id
    })
      const savedBlog = await blog.save().catch(error => next(error))
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
      return response.status(201).json(savedBlog)
  } catch(err) {
    next(err)
  }
})

blogRoutes.delete('/:id',userHandler,async (request,response) => {
  if(!request.token){
    response.send('missing jwt token')
  }
  try {
    const userid = request.user
    console.log('the user is=',userid) //exe-4.22

    const decodedToken = jwt.verify(request.token,process.env.SECRET)
    console.log('decoded=',decodedToken)
    if(!decodedToken.id){
      return response.status(401).json({error:'invalid token'})
    }

    const blog = await Blog.findById(request.params.id)
    console.log('blog =',blog)
    if(blog && blog.user._id.toString() === decodedToken.id){
     await Blog.findByIdAndDelete(request.params.id)
     response.status(204).end()
    }else{
      response.send('This user does not own this blog')
    }
   } catch(err) {
     response.status(500).json({error: err.message})
   }
})

blogRoutes.put('/:id', async (request,response) => {
  try {
    const updatedBlog = {
      likes: request.body.likes
    }
    const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog , {new:true})
    response.json(result)
  } catch (err) {
    response.status(500).send(err.message)
  }
})

module.exports = blogRoutes
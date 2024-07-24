const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const Blog = require('../../models/BlogModel')
const User = require('../../models/User')
const config = require('../../utils/config')
const api = supertest(app)
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

initialBlogs = [
    {
        "title": "blog1",
        "author": "ramu",
        "url": "ramublog.com",
        "likes": 23
    },
    {
        "title": "blog2",
        "author": "rahul",
        "url": "rahublog.com",
        "likes": 14
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

let token
let user
beforeEach(async () => {
    //empty the collections to keep DB in the same state before each test
    await User.deleteMany({})
    await Blog.deleteMany({})

    //create one user to add and delete to from the same user
    const saltrounds = 10
    const passwordHash = await bcrypt.hash('testUser',saltrounds)
    user = new User({
        name: 'testUser',
        username: 'testUser',
        passwordHash
    })
    await user.save()

    //create a token and keep it to be used in api calls
    const userForToken = {username: user.username, id: user._id}
    token = jwt.sign(userForToken,process.env.SECRET)

    //create 2 blogs
    let newBlog = new Blog({...initialBlogs[0],user: user.id})
    await newBlog.save()
    newBlog = new Blog({...initialBlogs[1],user: user.id})
    await newBlog.save()
})

test('returns the correct number of blogs',async () => {
   const response = await api.get('/api/blogs').expect(200).expect('Content-Type',/application\/json/)
   expect(response.body).toHaveLength(initialBlogs.length) 
})

test('successfully creates a blog', async () => {
    const blogPost = {
        title: "Some articele",
        author: "Rahul R",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 14,
        user: user._id
    }
    await api.post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogPost)
    .expect(201)
    .expect('Content-Type',/application\/json/)

    const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`)
    expect(response.body).toHaveLength(initialBlogs.length + 1)

},10000)

test("verifies that the blog post has an attribute 'id'", async () => {
   const response = await api.get('/api/blogs')
   expect(response.body).toHaveLength(initialBlogs.length);
   expect(response.body[0].id).toBeDefined()
   expect(response.body[0]._id).toBeUndefined()
})

test('verifies that likes defaults to 0 if not mentioned' , async () => {
    const blogPost = {
        title: "Some article",
        author: "Rahul R",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"
    }
   const result = await api.post('/api/blogs').set('Authorization', `Bearer ${token}`)
    .send(blogPost)
    .expect(201)
    .expect('Content-Type',/application\/json/)

    expect(result.body.likes).toBe(0)
})

test('verifies that url or title cannot be missing', async () => {
    const blogPost = {
        author: "Rahul R",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"
    }
    const blogPost2 = {
        author: "Rahul R",
        title: "book 2"
    }
   const result = await api.post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogPost)
    const result2 = await api.post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogPost2)

    expect(result.status).toBe(400)
    expect(result2.status).toBe(400)
})

test('can delete a blog', async () => {
    const blogsAtStart = await blogsInDb() // always use await if a function is async
    const blogToBeDeleted = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToBeDeleted.id}`).set('Authorization', `Bearer ${token}`).expect(204)
    const blogsAfterDelete = await blogsInDb()
    expect(blogsAfterDelete).toHaveLength(blogsAtStart.length - 1)
})

test('updates the likes of a blog', async () =>{
    const blogsAtStart = await blogsInDb()
    const blogToBeUpdated = blogsAtStart[0]
    const reqBody = {
        likes: 100
    }
    const updatedBlog = await api.put(`/api/blogs/${blogToBeUpdated.id}`).send(reqBody)
    expect(updatedBlog.body.likes).toBe(100)
})

afterAll( async () => {
    await mongoose.connection.close()
})
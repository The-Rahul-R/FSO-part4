const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const User = require('../../models/User')
const config = require('../../utils/config')
// const Test = require('supertest/lib/test')
const api = supertest(app)

initialUsers = [
    {
        "name": "ramu",
        "username": "rdr1",
        "password": "rdr1"
    },
    {
        "name": "balu",
        "username": "bda1",
        "password": "bda1"
    }
]

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

beforeEach(async () => {
    await User.deleteMany({})
    let newUser = new User(initialUsers[0])
    await newUser.save()
    newUser = new User(initialUsers[1])
    await newUser.save()
})

test('should not create invalid users',async ()=> {
    const invalidUser = {
        username:"rt",
        password:"rtr",
        name: "ramesh"
    }

    const invalidUser2 = {
        username: "rtr",
        password: "t",
        name:"xyz"
    }

    const createdUser = await api.post('/api/users').send(invalidUser)
    expect(createdUser.status).toBe(400)
    expect(createdUser.body.error).toMatch(/^User validation failed/)

    const createdUser2 = await api.post('/api/users').send(invalidUser2)
    expect(createdUser2.status).toBe(400)
    expect(createdUser2.text).toMatch(/password is less than 3 characters/)
})

afterAll( async () => {
    await mongoose.connection.close()
})
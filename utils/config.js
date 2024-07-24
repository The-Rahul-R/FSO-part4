require('dotenv').config() //this can be used elsewhere too, it loads content in .env file to process.env to be used globally
const MongoURL = process.env.NODE_ENV === 'test' ? process.env.TestMongoURL : process.env.MongoURL
const PORT = process.env.PORT

module.exports = {
    MongoURL,
    PORT
}
const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum,blog)=>{
        return sum + (blog.likes || 0)
    },0)
}

const favBlog = (blogs) => {
    if (blogs.length === 0) return null;
    let fav = blogs[0]
    let maxlikes = fav.likes || 0
    blogs.forEach(blog => {
        if(blog.likes > maxlikes) {
            fav = blog;
            maxlikes = fav.likes
        } 
    })
    return fav;
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null;
    let authorMostBlog = blogs[0].author;
    let maxBlogs = 0
    let authorMap = {}

    blogs.forEach(blog => {
        let author = blog.author
        if(authorMap[author]) {
            authorMap[author] ++
        } else {
            authorMap[author] = 1
        }
    })

    for(author in authorMap) {
        if(authorMap[author] > maxBlogs){
            maxBlogs = authorMap[author]
            authorMostBlog = author
        }
    }

    return {
        author: authorMostBlog,
        blogs: maxBlogs
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null;
    const groupedByAuthor = _.groupBy(blogs, 'author');
    const totalLikesByAuthor = _.mapValues(groupedByAuthor, blogs => _.sumBy(blogs, 'likes'));
    const authorWithMostLikes = _.maxBy(_.keys(totalLikesByAuthor), author => totalLikesByAuthor[author]);

    return {
        author: authorWithMostLikes,
        likes: totalLikesByAuthor[authorWithMostLikes]
    }
}
  
module.exports = {
dummy,
totalLikes,
favBlog,
mostBlogs,
mostLikes
}
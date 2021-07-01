const express = require('express')
const { graphqlHTTP } = require('express-graphql')
var { graphql, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql')
const { GraphQLSchema,GraphQLObjectType,GraphQLString} = require('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represent a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        autohorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (bk)=>authors.find(author=>bk.authorId===author.id)
        }
    })
})
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represent an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author)=>books.filter((book)=>book.authorId===author.id)
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: "Root",
    fields: () => ({
        books: {
            type: new GraphQLList (BookType),
            description: "List of All Books",
            resolve: ()=> books
        },
        book: {
            type: BookType,
            description: "Single Book",
            args: {
                id: { type: GraphQLInt },
                name: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                if (args.id) {
                    return books.find(book=>book.id===args.id)
                }
                return books.find(book=>book.name===args.name)
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of All Authors",
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: "Single Author",
            args: {
                id:{type:GraphQLInt}
            },
            resolve: (parents,args) => authors.find(author=>author.id===args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId:{ type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents,args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.id
                }
                books.push(book);
                return book;
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))
app.listen(5000., () => console.log('server is running'))
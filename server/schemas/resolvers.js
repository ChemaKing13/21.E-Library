//define the query and mutation functionality to work with the Mongoose models
const { AuthenticationError } = require('apollo-server-express'); 
const { User } = require('../models');
const { signToken } = require('../utils/auth');   

const resolvers = {
    //this resolver returns the users own profile if they are logged, if not the error is thrown
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }); 
            }
            throw new AuthenticationError('You need to be logged in!'); 
        },
    },
    
    Mutation: {
        //this resolver handles the addUser mutation in order to create a new user in the db, it returns
        //a user and a token
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password }); 
            const token = signToken(user); 

            return { token, user }; 
        },
        //handles the login mutation wich perfomrs user login, by findind the user by uts email 
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email }); 

            const correctPW = await user.isCorrectPassword(password); 

            if (!user || !correctPW ) {
                throw new AuthenticationError('Incorrect credentials'); 
            }

            const token = signToken(user); 
            return { token, user };
        },
        //remove book, wich removes a book from a user's saved books array
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const user = await User.findOneAndUpdate(
                   { _id: context.user._id },
                   { $pull: { savedBooks: { bookId } } },
                   { new: true}
                ); 
                return user; 
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        //this mutation adds a book to a users saved books array
        savedBook: async (parent, { input }, context) => {
            if (context.user) {
                const newBook = await User.findOneAndUpdate(
                    { _id: context.user.id },
                    { $push: { savedBooks: input } },
                    { new: true}
                ); 
                return newBook; 
            }
            throw new AuthenticationError('You need to be logged in!'); 
        }
    }
}; 

module.exports = resolvers; 





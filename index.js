const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

// Connect to database
connectDB();

// Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        // console.log(req.headers['authorization']);
        // const myContext = "Hellow Word!";
        // console.log(req.headers);
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET_KEY);
                // console.log(user);
                return {
                    user,
                };
            } catch (e) {
                console.log(e);
            }
        }
    },
});

// Start Server
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Server ready in url ${url} 🚀`);
});

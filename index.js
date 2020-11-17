const { ApolloServer, gql } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    # This "Book" type defines the queryable fields for every book in our data source.
    type ContactForm {
        name: String!
        email: String!
        message: String!
        timestamp: Int
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    type Query {
        contactForms: [ContactForm]
    }
`;

const contact_forms = [
    {
        name: 'The Awakening',
        email: 'Kate Chopin',
        message: 'Kasdfasdfate Chopin',
    },
    {
        name: 'City of Glass',
        email: 'Paul Auster',
        message: 'asdfasdfe',
    },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        contactForms: () => {
            const fs = require('fs');

            fs.appendFile(
                'helloworld.txt',
                `name: ${contact_forms[0].name}\n`,
                function (err) {
                    if (err) return console.log(err);
                    console.log('Hello World > helloworld.txt');
                }
            );
            return contact_forms;
        },
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});

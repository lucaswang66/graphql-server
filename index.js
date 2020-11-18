const { ApolloServer, gql } = require('apollo-server');
const { promises } = require('dns');

const fs = require('fs');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    # This "Book" type defines the queryable fields for every book in our data source.
    type ContactForm {
        name: String!
        email: String!
        message: String
        timestamp: Int
    }

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    type Query {
        contactForms: [ContactForm]
    }

    type Mutation {
        addContactForm(
            name: String
            email: String
            message: String
        ): ContactForm
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
            const forms = require('./forms');
            return forms;
        },
    },
    Mutation: {
        addContactForm(parent, args, context, info) {
            //Logging
            fs.appendFile(
                'contact_forms.log',
                `<<<<<new entry>>>>>\nname: ${args.name}\nemail: ${args.email}\nmessage: ${args.message}\n\n\n`,
                (err) => {
                    if (err) return console.log(err);
                    console.log('mutation write success');
                }
            );

            // Retrieve data from json
            let forms = require('./forms');
            forms.push(args);
            forms = JSON.stringify(forms);

            // Update json
            fs.writeFile('forms.json', forms, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });

            return args;
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

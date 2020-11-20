const { ApolloServer, gql, UserInputError } = require('apollo-server');
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
        message: String!
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
        addContactForm: async (parent, args, context, info) => {
            let { name, email, message } = args;
            let errors = {};

            try {
                if (
                    !email.trim().match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
                ) {
                    errors.email = 'this is not a valid email address';
                }
                if (email.trim() === '') {
                    errors.email = 'email must not be empty';
                }
                if (name.trim() === '') {
                    errors.name = 'name must not be empty';
                }
                if (message.trim() === '') {
                    errors.message = 'message must not be empty';
                }

                if (Object.keys(errors).length > 0) {
                    throw errors;
                }

                //Logging
                fs.appendFile(
                    'contact_forms.log',
                    `<<<<<new entry>>>>>\nname: ${args.name}\nemail: ${args.email}\nmessage: ${args.message}\n\n\n`,
                    (err) => {
                        if (err) throw err;
                        console.log('mutation write success');
                    }
                );

                //logging to console
                console.log(
                    `\n\n<<<<<new entry>>>>>\nname: ${args.name}\nemail: ${args.email}\nmessage: ${args.message}\n\n`
                );

                // Retrieve data from json
                let forms = require('./forms');
                forms.push(args);
                formsStringified = JSON.stringify(forms);

                // Update json
                fs.writeFile('forms.json', formsStringified, (err) => {
                    if (err) throw err;
                    console.log('The file has been saved!');
                });

                return args;
            } catch (err) {
                console.log(err);

                throw new UserInputError('Bad inpout', { errors });
            }
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

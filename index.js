const { ApolloServer, gql } = require('apollo-server');
const { SQLDataSource } = require('datasource-sql');

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  }
];

const resolvers = {
  Query: {
    books: () => books,
  },
};

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: "db.sqlite"
  }
}

const MINUTE = 60;

class WikiAPI extends SQLDataSource {
  getPages() {
    return this.knex
      .select("*")
      .from("pages")
      .where({ id: 1})
      .cache(MINUTE);
  }
}

const server = new ApolloServer({ 
  typeDefs,
  resolvers,
  dataSources: {
    wikiAPI: new WikiAPI(knexConfig),
  }
 });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
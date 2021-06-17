const types = /* GraphQL */`
type Query {
  hello: String 
}
`

const resolvers = {
  Query: {
    hello: () => 'Hello, Kretes'
  }
}

export { types, resolvers };

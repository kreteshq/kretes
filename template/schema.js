const typeDefs = `
type Widget {
  id: Int!
  name: String!
}
type Query {
  widgets: [Widget]
  widgetByName(name: String!): Widget
}
`;

module.exports = typeDefs;

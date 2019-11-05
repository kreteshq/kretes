const { Widget, widgets, widgetByName } = require('./widget');

const Query = `
type Query {
  widgets: [Widget]
  widgetByName(name: String!): Widget
}
`;

const typeDefs = [Query, Widget];

const resolvers = {
  Query: {
    widgets,
    widgetByName
  }
};

module.exports = { typeDefs, resolvers };

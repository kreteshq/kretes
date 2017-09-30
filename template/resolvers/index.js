
function widgets() {
  return [
    { id: 1, name: 'Widget 1' },
    { id: 2, name: 'Widget 2' },
  ];
}

function widgetByName(_, { name }) {
  return {
    id: 1,
    name: 'Widget 1'
  }
}

const resolvers = {
  Query: {
    widgets,
    widgetByName
  }
};

module.exports = resolvers;

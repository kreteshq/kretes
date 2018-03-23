const widgets = require('./widgets');
const widgetByName = require('./widgetByName');

const Widget = `
type Widget {
  id: Int!
  name: String!
}
`;

module.exports = { Widget, widgets, widgetByName };

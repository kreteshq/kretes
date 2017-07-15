const { createStore, applyMiddleware } = require('redux');

const reducer = require('./reducers');
const { WidgetsService } = require('./services/widgets');

module.exports = createStore(reducer,
  applyMiddleware(
    WidgetsService()
  )
);

const { observable, action } = require('mobx');

const store = observable({
  counter: 7,
  increment: action(function() {
    this.counter++;
  })
})

module.exports = store;

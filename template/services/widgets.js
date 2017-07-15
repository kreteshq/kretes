function WidgetsService() {
  return store => dispatch => action => {
    dispatch(action)

    switch (action.type) {
      // here goes action handlers with side effects
    }
  }
}

module.exports = { WidgetsService };

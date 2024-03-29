import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from "react-redux"
import createStore from "./store"

import 'semantic-ui-css/semantic.min.css'

const store = createStore()
const rootEl = document.getElementById('root')
let render = () => {
  const App = require('./App').default
  ReactDOM.render((<Provider store={store}><App /></Provider>), rootEl)
}
if(module.hot) {
  const renderApp = render
  const renderError = (error) => {
    const RedBox = require("redbox-react").default
    ReactDOM.render((<RedBox error={error} />), rootEl)
  }
  render = () => {
    try { renderApp() }
    catch(error) {
      console.error(error)
      renderError(error)
    }
  }
  module.hot.accept('./App', () => setTimeout(render))
}

render()

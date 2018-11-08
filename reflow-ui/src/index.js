import React from 'react'
import ReactDOM from 'react-dom'


const rootEl = document.getElementById('root')

let render = () => {
  const App = require('./App').default
  ReactDOM.render((<App />), rootEl)
}

if (module.hot) {
  const renderApp = render
  const renderError = (error) => {
    const RedBox = require('redbox-react').default
    ReactDOM.render((<RedBox error={error} />), rootEl)
  }

  render = () => {
    try {
      renderApp()
    } catch (error) {
      console.error(error)
      renderError(error)
    }
  }

  module.hot.accept('./App', () => setTimeout(render))
}

render()

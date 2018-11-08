import React from 'react'
import _ from 'lodash'

import Store from 'reflow-store/src/Store.js'
import { createProgram } from 'reflow-engine/examples/example01.js'
import Program from './components/Program.js'


class App extends React.Component {
  constructor (props) {
    super(props)
    this.store = new Store()
    this.program = createProgram({
      programArgs: [{store: this.store}]
    })
    this.state = {derivedState: {}}
    this.store.subscribe(_.debounce(() => {
      const nextDerivedState = this.store.getDerivedState({
        prevDerivedState: this.state.derivedState
      })
      this.setState({derivedState: nextDerivedState})
    }), 0)
  }

  render () {
    console.log("state: ", this.state)
    return (
      <div>
        App foo
        {this.renderProgram()}
      </div>
    )
  }

  renderProgram () {
    const program = _.get(this.state, ['derivedState', 'program'])
    if (! program) { return null }
    return (<Program program={program} />)
  }

  componentDidMount () {
    this.program.run()
  }
}

export default App

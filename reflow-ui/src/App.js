import React from 'react'
import _ from 'lodash'

import Store from 'reflow-store/src/Store.js'
import { createProgram } from 'reflow-engine/examples/example01.js'
import Program from './components/Program.js'


class App extends React.Component {
  constructor (props) {
    super(props)
    this.store = new Store()
    this.program = this._createProgram()
    this.state = {derivedState: {}}
    this.store.subscribe(_.debounce(() => {
      const nextDerivedState = this.store.getDerivedState({
        prevDerivedState: this.state.derivedState
      })
      this.setState({derivedState: nextDerivedState})
    }), 0)
  }

  _createProgram () {
    const program = createProgram({
      programArgs: [{store: this.store}]
    })
    program.run()
    // set proc ui states
    const procs = program.getProcs()
    let counter = 0
    _.each(procs, (proc, procId) => {
      program.updateProc({
        id: procId,
        updates: {
          uiState: {
            position: {
              x: counter * 100,
              y: counter * 100,
            },
            dimensions: {
              width: 200,
              height: 200,
            }
          }
        }
      })
      counter += 1
    })
    return program
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
    return (<Program program={program} actions={this.store.actions} />)
  }
}

export default App

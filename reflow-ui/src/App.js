import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'
import { createProgram } from 'reflow-engine/examples/example01.js'
import { actionCreators } from './actions.js'
import Program from './components/Program.js'


class App extends React.Component {
  constructor (props) {
    super(props)
    this.program = createProgram()
    this.program.store.subscribe(_.debounce(() => {
      this.props.actions.setEngineState({
        engineState: this.program.store.getDerivedState()
      })
    }), 0)
  }

  render () {
    return (
      <div>
        App foo
        {this.renderProgram()}
      </div>
    )
  }

  renderProgram () {
    const { program } = this.props
    if (! program) { return null }
    return (<Program program={program} actions={this.props.actions} />)
  }

  componentDidMount () {
    this._setProcPositions({procs: this.program.getProcs()})
    this.program.run()
  }

  _setProcPositions ({procs}) {
    let counter = 0
    _.each(procs, (proc, procId) => {
      this.props.actions.updateProcUiState({
        procId,
        updates: {
          position: {
            x: counter * 100,
            y: counter * 100,
          },
          dimensions: {
            width: 200,
            height: 200,
          }
        }
      })
      counter += 1
    })
  }
}

function _selectMergedProgram ({engineState, procUiStates}) {
  const engineStateProgram = engineState.program
  if (! engineStateProgram) { return null }
  return {
    ...engineStateProgram,
    procs: _.mapValues(engineStateProgram.procs, (proc) => {
      return {
        ...proc,
        uiState: _.get(procUiStates, [proc.id], {})
      }
    })
  }
}

function mapStateToProps(state) {
  return { program: _selectMergedProgram(state) }
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(actionCreators, dispatch) }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

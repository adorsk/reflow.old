import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'
import { createProgramEngine } from 'reflow-engine/examples/example-01-basic/entrypoint.js'
import { actionCreators } from './actions.js'
import Program from './components/Program.js'


class App extends React.Component {
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
    if (! this.props.programEngine) {
      this._setupProgramEngine()
    }
  }

  _setupProgramEngine () {
    const programEngine = createProgramEngine()
    this.props.actions.setProgramEngine({programEngine})
    const initialEngineState = programEngine.store.getDerivedState()
    this._setInitialProcPositions({
      procIds: _.keys(_.get(initialEngineState, ['program', 'procs'], {}))
    })
    this.props.actions.setEngineState({engineState: initialEngineState})
    programEngine.store.subscribe(_.debounce(() => {
      this.props.actions.setEngineState({
        engineState: programEngine.store.getDerivedState()
      })
    }), 0)
    programEngine.run()
  }

  _setInitialProcPositions ({procIds}) {
    let counter = 0
    for (let procId of procIds) {
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
    }
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
  return {
    programEngine: state.programEngine,
    program: _selectMergedProgram(state),
  }
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(actionCreators, dispatch) }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

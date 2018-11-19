import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'

import { actionCreators } from './actions/index.js'
import ProgramEditor from './components/ProgramEditor.js'


class App extends React.Component {
  render () {
    return (
      <div>
        {this.renderProgramEditor()}
      </div>
    )
  }

  renderProgramEditor () {
    return (
      <ProgramEditor
        actions={this.props.actions}
        programEngine={this.props.programEngine}
        programEditor={this.props.programEditor}
        componentLibrary={this.props.componentLibrary}
      />
    )
  }

  componentDidMount () {
    if (! _.get(this.props.componentLibrary, 'components')) {
      this.props.actions.componentLibrary.loadComponentLibrary()
    }
  }
}

function mapStateToProps(state) {
  return {
    programEditor: state.programEditor,
    programEngine: state.programEngine,
    componentLibrary: state.componentLibrary,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: _.mapValues(actionCreators, (actionCreatorsForKey) => {
      return bindActionCreators(actionCreatorsForKey, dispatch)
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

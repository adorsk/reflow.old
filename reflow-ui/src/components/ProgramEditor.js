import React from 'react'

import Program from './Program.js'

class ProgramEditor extends React.Component {
  render () {
    return (
      <div>
        {this._renderProgram()}
      </div>
    )
  }

  _renderProgram () {
    const program = this.props.program
    if (! program) { return null }
    return (<Program actions={this.props.actions} program={program} />)
  }
}

export default ProgramEditor

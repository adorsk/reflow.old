import React from 'react'
import { Container, Grid } from 'semantic-ui-react'

import Program from './Program.js'
import ComponentLibrary from './ComponentLibrary.js'
import AddWireForm from './AddWireForm.js'

class ProgramEditor extends React.Component {
  render () {
    return (
      <div>
        <Container>
          <Grid>

            <Grid.Row>
              <Grid.Column width={16}>
                {this._renderAddWireForm()}
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={12}>
                {this._renderProgram()}
              </Grid.Column>
              <Grid.Column width={4}>
                {this._renderComponentLibrary()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    )
  }

  _renderAddWireForm () {
    const { program, actions } = this.props
    return (<AddWireForm program={program} actions={actions} />)
  }

  _renderProgram () {
    const program = this.props.program
    if (! program) { return null }
    return (
      <Program
        actions={this.props.actions}
        program={program}
      />
    )
  }

  _renderComponentLibrary () {
    return (
      <ComponentLibrary
        actions={this.props.actions}
        componentLibrary={this.props.componentLibrary}
      />
    )
  }
}

export default ProgramEditor

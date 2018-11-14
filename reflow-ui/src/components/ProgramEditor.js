import React from 'react'
import { Container, Grid } from 'semantic-ui-react'


import Program from './Program.js'

class ProgramEditor extends React.Component {
  render () {
    return (
      <div>
        <Container>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                {this._renderProgram()}
              </Grid.Column>
              <Grid.Column width={4}>
                right
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
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

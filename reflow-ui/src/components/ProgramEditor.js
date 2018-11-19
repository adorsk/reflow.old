import React from 'react'
import { Container, Grid } from 'semantic-ui-react'

import ProgramCanvas from './ProgramCanvas.js'
import ComponentLibrary from './ComponentLibrary.js'

class ProgramEditor extends React.Component {
  render () {
    return (
      <div>
        <Container>
          <Grid
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          >
            <Grid.Row>
              <Grid.Column width={12}>
                <div style={{height: '100%', width: '100%', position: 'relative'}}>
                  {this._renderProgramCanvas()}
                </div>
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

  _renderProgramCanvas () {
    const program = this.props.programEditorState.program
    if (! program) { return null }
    return (
      <ProgramCanvas
        actions={this.props.actions}
        program={program}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          overflow: 'scroll',
        }}
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

  componentDidMount () {
    if (!this.props.programEngine) {
      this.props.actions.programEngine.loadProgramEngine()
    }
  }
}

export default ProgramEditor

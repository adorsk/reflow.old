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
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <div style={{flex: '0 1 auto'}}>
                    {this._renderAddWireForm()}
                  </div>
                  <div
                    style={{
                      flex: '1 1 auto',
                      position: 'relative',
                      border: 'thin solid gray',
                    }}
                  >
                    {this._renderProgram()}
                  </div>
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
}

export default ProgramEditor

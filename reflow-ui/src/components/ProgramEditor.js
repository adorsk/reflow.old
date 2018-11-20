import React from 'react'
import _ from 'lodash'
import { Container, Grid } from 'semantic-ui-react'
import FileSaver from 'file-saver'

import ProgramCanvas from './ProgramCanvas.js'
import ComponentLibrary from './ComponentLibrary.js'
import Serializer from '../Serializer.js'

class ProgramEditor extends React.Component {
  constructor (props) {
    super(props)
    this.programCanvasRef = React.createRef()
    this.uploadInputRef = React.createRef()
  }

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
                <button onClick={() => this.save()}>save</button>
                {this._renderComponentLibrary()}
                <hr/>
                <input ref={this.uploadInputRef} type="file"
                  onChange={() => this.load()} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    )
  }

  _renderProgramCanvas () {
    const programEngine = this.props.programEngine.engine
    if (! programEngine) { return null }
    return (
      <ProgramCanvas
        ref={this.programCanvasRef}
        actions={this.props.actions}
        programEngine={programEngine}
        programEditorState={this.props.programEditor}
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
    /*
    if (!this.props.programEngine.engine) {
      this.props.actions.programEngine.loadProgramEngine()
    }
    */
  }

  save () {
    console.log('save')
    const serializer = new Serializer()
    const serialization = serializer.serialize({
      programState: {
        programEngine: this.props.programEngine.engine,
        frameStates: this.props.programEditor.procFrameStates,
        widgetStates: this.props.programEditor.procWidgetStates,
      },
      widgets: this.programCanvasRef.current.getWidgets()
    })
    const jsonSerialization = JSON.stringify(serialization, null, 2)
    let blob = new Blob(
      [jsonSerialization],
      {type: "application/json;charset=utf-8"}
    )
    FileSaver.saveAs(blob, "program.json")
  }

  load () {
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const serialization = JSON.parse(evt.target.result)
      const serializer = new Serializer()
      const deserialized = await serializer.deserialize({
        serialization,
        componentLibrary: _.get(this.props.componentLibrary, 'componentLibrary')
      })
      console.log('yo')
      this.props.actions.programEngine.setEngine({
        engine: deserialized.programEngine})
      this.props.actions.programEditor.setProcFrameStates(
        deserialized.frameStates)
      this.props.actions.programEditor.setProcWidgetStates(
        deserialized.widgetStates)
    }
    reader.readAsText(this.uploadInputRef.current.files[0])
  }
}

export default ProgramEditor

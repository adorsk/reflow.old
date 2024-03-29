import React from 'react'


class Widget extends React.Component {
  constructor (props) {
    super(props)
    this.widgetContainerRef = React.createRef()
  }

  render () {
    const widgetState = this.props.widgetState
    return (
      <div>
        widget!
        <div ref={this.widgetContainerRef}>
          <label>widgetState</label>
          <code>
            {JSON.stringify(widgetState, null, 2)}
          </code>
        </div>
      </div>
    )
  }

  componentDidMount () {
    this._createWidget()
  }

  async _createWidget () {
    const component = this.props.proc.component
    if (!component || !component.createWidget) {
      this._updateWidgetState({updates: {status: 'NO_WIDGET'}})
      return
    }
    this.widget = await component.createWidget({
      container: this.widgetContainerRef.current,
      updateProcOutputs: ({updates}) => {
        this.props.actions.programEngine.updateProcOutputs({
          procId: this.props.proc.id,
          updates
        })
      }
    })
    this._updateWidgetState({updates: {status: 'LOADED'}})
  }

  _updateWidgetState ({updates}) {
    this.props.actions.programEditor.updateProcWidgetState({
      procId: this.props.proc.id,
      updates
    })
  }

  componentDidUpdate () {
    this._updateWidget()
  }

  _updateWidget () {
    if (!this.widget || !this.widget.update) { return }
    this.widget.update({proc: this.props.proc})
  }

  getWidget () { return this.widget }
}

export default Widget

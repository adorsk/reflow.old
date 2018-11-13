import React from 'react'
import _ from 'lodash'

import Port from './Port.js'
import Widget from './Widget.js'

class Proc extends React.Component {
  constructor (props) {
    super(props)
    this.portRefs = {}
    this.labelRef = React.createRef()
    this.widgetContainerRef = React.createRef()
  }

  render () {
    const { proc, style } = this.props
    return (
      <div
        className='proc-container'
        style={style}
      >
        <div
          className='proc-frame'
          style={{
            width: 200,
            height: 200,
            borderRadius: 2,
            border: 'thin solid gray',
            padding: 2,
          }}
        >
          <label
            ref={this.labelRef}
            className='proc-name'
            style={{
              display: 'block',
              cursor: 'pointer',
              backgroundColor: 'rgba(0, 0, 0, .05)',
              padding: 2,
              borderRadius: 2,
              border: 'thin solid gray',
              textAlign: 'center',
            }}
          >
            {proc.label || proc.id}
          </label>
          <div key="body" className='proc-body'>
            {this.renderInputPorts()}
            {this.renderWidget()}
            {this.renderOutputPorts()}
          </div>
        </div>
      </div>
    )
  }

  renderInputPorts () {
    return this.renderPortGroup({
      groupType: 'input',
      portDefs: this.props.proc.inputs,
    })
  }

  renderPortGroup ({groupType, portDefs}) {
    return (
      <div className={`io-ports ${groupType}-ports`}>
        {
          _.sortBy(portDefs.ports, 'position')
            .map((portDef) => {
              return this.renderPort({
                portDef,
                ioType: groupType,
                value: portDefs.values[portDef.id],
              })
            })
        }
      </div>
    )
  }

  renderPort ({portDef, ioType, value}) {
    return (
      <Port
        key={portDef.id}
        portDef={portDef}
        value={value}
        ioType={ioType}
        afterMount={(el) => {
          this.portRefs[portDef.id] = el
        }}
        beforeUnmount={(el) => {
          delete this.portRefs[portDef.id]
        }}
      />
    )
  }

  renderOutputPorts () {
    return this.renderPortGroup({
      groupType: 'output',
      portDefs: this.props.proc.outputs,
    })
  }

  renderWidget () {
    const proc = this.props.proc
    return (
      <div
        ref={this.widgetContainerRef}
        className='proc-widget-container'>
        <Widget proc={proc} />
      </div>
    )
  }

  componentDidMount () {
    if (this.props.afterMount) { this.props.afterMount(this) }
  }

  componentWillUnmount () {
    if (this.props.beforeUnmount) { this.props.beforeUnmount(this) }
  }

  getPortPosition ({ioType, portId}) {
    if (! this.portRefs[portId]) { return null }
    return this.portRefs[portId].getPosition()
  }
}

export default Proc

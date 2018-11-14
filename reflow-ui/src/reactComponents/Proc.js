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
    return this.renderPortGroup({ioType: 'inputs'})
  }

  renderPortGroup ({ioType}) {
    const proc = this.props.proc
    const portDefs = _.get(proc, ['component', 'ports', `${ioType}`], [])
    return (
      <div className={`io-ports ${ioType}-ports`}>
        {
          _.sortBy(portDefs, 'position').map((portDef) => {
            return this.renderPort({
              portDef,
              ioType,
              value: _.get(proc, [ioType, portDef.id]),
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
        ioType={ioType}
        value={value}
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
    return this.renderPortGroup({ioType: 'outputs'})
  }

  renderWidget () {
    const proc = this.props.proc
    return (
      <div
        ref={this.widgetContainerRef}
        className='proc-widget-container'>
        <Widget proc={proc} actions={this.props.actions} />
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

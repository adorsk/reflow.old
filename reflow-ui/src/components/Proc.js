import React from 'react'
import _ from 'lodash'
import { getPagePos } from '../utils.js'


import Port from './Port.js'
import Widget from './Widget.js'

class Proc extends React.Component {
  constructor (props) {
    super(props)
    this.portRefs = {}
    this.labelRef = React.createRef()
    this.containerRef = React.createRef()
    this.widgetRef = React.createRef()
  }

  render () {
    const { proc, style } = this.props
    return (
      <div
        className='proc-container'
        ref={this.containerRef}
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
        procId={this.props.proc.id}
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
        className='proc-widget-container'>
        <Widget
          ref={this.widgetRef}
          proc={proc}
          actions={this.props.actions}
          widgetState={this.props.widgetState}
        />
      </div>
    )
  }

  componentDidMount () {
    if (this.props.afterMount) { this.props.afterMount(this) }
  }

  componentWillUnmount () {
    if (this.props.beforeUnmount) { this.props.beforeUnmount(this) }
  }

  getPortHandlePagePos ({portId}) {
    if (! this.portRefs[portId]) { return null }
    const handleEl = this.portRefs[portId].getHandleEl()
    const handleRect = handleEl.getBoundingClientRect()
    const pagePos = getPagePos(handleEl)
    pagePos.y += (handleRect.height / 2)
    return pagePos
  }

  getWidget () {
    return (this.widgetRef.current) ? this.widgetRef.current.getWidget() : null
  }
}

export default Proc

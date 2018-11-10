import React from 'react'
import _ from 'lodash'

import Port from './Port.js'

class Proc extends React.Component {
  constructor (props) {
    super(props)
    this.portRefs = {}
    this.labelRef = React.createRef()
    this.interfaceContainerRef = React.createRef()
    this.procInstance = null
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
            {this.renderActionButtons()}
            <div>
              {this.renderInputPorts()}
              {
                (proc.importStatus === 'IMPORTED')
                  ? this.renderProcInterface()
                  : `importStatus: ${proc.importStatus}`
              }
              {this.renderOutputPorts()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderActionButtons () {
    return (
      <div className='proc-actions'>
        <button onClick={() => { this.runProc() }}>
          run
        </button>
      </div>
    )
  }

  runProc () {
    const outputValues = (
      this.procInstance.run({
        inputValues: _.get(this.props.proc, ['inputs', 'values'], {})
      })
      || {}
    )
    this.props.setOutputValues({outputValues})
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

  renderProcInterface () {
    return (
      <div
        ref={this.interfaceContainerRef}
        className='proc-interface-container'>
        TK: Proc Interface
      </div>
    )
  }

  componentDidMount () {
    const { proc } = this.props
    if (proc) {
      if (proc.importStatus === 'IMPORTED') {
        this.initializeProc()
      } else {
        this.props.loadWidget({id: proc.id})
      }
    }
    if (this.props.afterMount) { this.props.afterMount(this) }
  }

  componentDidUpdate (prevProps) {
    const didImport = (
      (prevProps.proc.importStatus === 'IMPORTING')
      && (this.props.proc.importStatus === 'IMPORTED')
    )
    if (didImport) {
      this.initializeProc()
      return
    }
    const inputValuesPath = ['proc', 'inputs', 'values']
    const inputValues = _.get(this.props, inputValuesPath)
    const prevInputValues = _.get(prevProps, inputValuesPath)
    const inputValuesHaveChanged = (! _.isEqual(inputValues, prevInputValues))
    if (inputValuesHaveChanged) { this.runProc() }
  }

  initializeProc () {
    const module = this.props.proc.module
    this.procInstance = module.factory()
    this.procInstance.renderInto({parentNode: this.interfaceContainerRef.current})
  }

  componentWillUnmount () {
    if (this.procInstance && this.procInstance.destroy) {
      this.procInstance.destroy()
    }
    if (this.props.beforeUnmount) { this.props.beforeUnmount(this) }
  }

  getPortPosition ({ioType, portId}) {
    if (! this.portRefs[portId]) { return null }
    return this.portRefs[portId].getPosition()
  }
}

export default Proc

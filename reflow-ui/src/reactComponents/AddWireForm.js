import React from 'react'
import _ from 'lodash'
import Select from 'react-select'


class AddWireForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedSrcOption: null,
      selectedDestOption: null,
    }
  }

  render () {
    const { selectedSrcOption, selectedDestOption } = this.state
    const options = this._getOptionsForPorts()
    return (
      <div>
        <span>
          <label>src</label>
          <Select
            options={options['outputs']}
            value={selectedSrcOption}
            onChange={(value) => this.setState({selectedSrcOption: value})}
          />
        </span>
        <span>
          <label>dest</label>
          <Select
            options={options['inputs']}
            value={selectedDestOption}
            onChange={(value) => this.setState({selectedDestOption: value})}
          />
        </span>
        <span>
          <button onClick={() => this._addWire()}>+</button>
        </span>
      </div>
    )
  }

  _getOptionsForPorts () {
    const portsByIoType = this._selectPortsByIoType()
    const options = {}
    _.each(portsByIoType, (portsForIoType, ioType) => {
      options[ioType] = _.map(portsForIoType, (port) => {
        return {
          label: ([
            port.proc.id,(port.port.label || port.port.id)
          ].join(':')),
          value: port,
        }
      })
    })
    return options
  }

  _selectPortsByIoType () {
    const { program } = this.props
    const ioTypes = ['inputs', 'outputs']
    const portsByIoType = {}
    for (let ioType of ioTypes) { portsByIoType[ioType] = [] }
    const procs = _.values(_.get(program, ['procs'], {}))
    for (let proc of procs) {
      const procPorts = _.get(proc, ['component', 'ports'], {})
      for (let ioType of ioTypes) {
        for (let port of _.get(procPorts, ioType, [])) {
          portsByIoType[ioType].push({port, proc})
        }
      }
    }
    return portsByIoType
  }

  _addWire () {
    const {selectedSrcOption, selectedDestOption} = this.state
    const srcPort = selectedSrcOption.value
    const destPort = selectedDestOption.value
    if (! srcPort || ! destPort) { return }
    this.props.actions.addWire({
      wire: {
        src: {
          procId: srcPort.proc.id,
          portId: srcPort.port.id
        },
        dest: {
          procId: destPort.proc.id,
          portId: destPort.port.id
        },
      }
    })
  }
}

export default AddWireForm

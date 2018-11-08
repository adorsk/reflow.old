import React from 'react'
import _ from 'lodash'

import Proc from './Proc.js'
import Wire from './Wire.js'
import AddWireForm from './AddWireForm.js'


class Program extends React.Component {
  constructor (props) {
    super(props)
    this.procRefs = {}
    this.wireRefs = {}
    this._wiresFromProc = {}
    this._wiresToProc = {}
  }

  render () {
    const { program } = this.props
    if (! program) { return null } 
    return (
      <div className='program'>
        <div>
          {this._renderAddWireForm()}
        </div>
        <div
          className='program-content-container'
          style={{position: 'relative'}}
        >
          {this.renderProcs({procs: program.procs})}
          {this.renderWires({wires: program.wires})}
        </div>
      </div>
    )
  }

  _renderAddWireForm () {
    return (
      <AddWireForm
        portInfos={this._getPortInfos()}
        addWire={this._addWire.bind(this)}
      />
    )
  }

  _getPortInfos () {
    const { program } = this.props
    const ioTypes = ['inputs', 'outputs']
    const portInfos = {}
    _.each(program.procs, (proc, procId) => {
      for (let ioType of ioTypes) {
        _.each(proc[ioType].handles, (handle, handleId) => {
          const infoId = [procId, ioType, handleId].join(':')
          portInfos[infoId] = {
            id: infoId,
            procId,
            ioType,
            handle
          }
        })
      }
    })
    return portInfos
  }

  _addWire ({src, dest}) {
    const { program } = this.props
    this.props.addWire({props: {program, src, dest}})
  }

  renderProcs ({procs}) {
    return (
      <div
        className='procs-container'
        style={{position: 'absolute'}}
      >
        {
          _.map(procs, (proc) => {
            return this.renderProc({proc})
          })
        }
      </div>
    )
  }

  renderProc ({proc}) {
    return (
      <Proc
        key={proc.id}
        proc={proc}
        style={{
          position: 'absolute',
          //left: proc.position.x,
          //top: proc.position.y,
        }}
        afterMount={(el) => { this.procRefs[proc.id] = el }}
        beforeUnmount={() => { delete this.procRefs[proc.id] }}
        setOutputValues={({outputValues}) => {
          console.log('setOutputValues')
        }}
        loadWidget={() => console.log('loadWidget')}
      />
    )
  }

  renderWires ({wires}) {
    return (
      <svg
        className='wires-container'
        style={{
          position: 'absolute',
          overflow: 'visible',
          width: 2,
          height: 2,
        }}
      >
        {
          _.map(wires, (wire) => {
            return this.renderWire({wire})
          })
        }
      </svg>
    )
  }

  renderWire ({wire}) {
    return (
      <Wire
        key={wire.id}
        afterMount={(el) => { this.wireRefs[wire.id] = el }}
        beforeUnmount={() => { delete this.wireRefs[wire.id] }}
      />
    )
  }

  componentDidMount () {
    this._updateWires()
  }

  componentDidUpdate (prevProps) {
    this._updateWires()
  }

  _updateWires () {
    if (! this.props.program) { return }
    this._updateWireRegistry()
    this._updateWirePaths()
  }

  _updateWireRegistry () {
    const wires = this.props.program.wires
    this._wiresFromProc = _.groupBy(wires, _.property(['src', 'procId']))
    this._wiresToProc = _.groupBy(wires, _.property(['dest', 'procId']))
  }

  _updateWirePaths () {
    _.each(this.props.program.wires, (wire) => {
      const { src, dest } = wire
      const srcProcRef = this.procRefs[src.procId]
      const srcHandlePos = srcProcRef.getPortPosition({portId: src.portId})
      const destProcRef = this.procRefs[dest.procId]
      const destHandlePos = destProcRef.getPortPosition({portId: dest.portId})
      const wireRef = this.wireRefs[wire.id]
      wireRef.setPositions({
        src: srcHandlePos,
        dest: destHandlePos,
      })
    })
  }
}

export default Program

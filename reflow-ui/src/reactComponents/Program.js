import React from 'react'
import _ from 'lodash'
import interact from 'interactjs'

import Proc from './Proc.js'
import Wire from './Wire.js'


class Program extends React.Component {
  constructor (props) {
    super(props)
    this.procRefs = {}
    this.wireRefs = {}
    this.wiresContainerRef = React.createRef()
    this._wiresFromProc = {}
    this._wiresToProc = {}
  }

  render () {
    const { program } = this.props
    if (! program) { return null } 
    return (
      <div className='program'>
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

  _getPortInfos () {
    const { program } = this.props
    const portTypes = ['inputs', 'outputs']
    const portInfos = {}
    _.each(program.procs, (proc, procId) => {
      for (let portType of portTypes) {
        _.each(proc[portType].handles, (handle, handleId) => {
          const infoId = [procId, portType, handleId].join(':')
          portInfos[infoId] = {
            id: infoId,
            procId,
            portType,
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
          _.filter(procs, (proc) => !proc.hidden).map((proc) => {
            return this.renderProc({proc})
          })
        }
      </div>
    )
  }

  renderProc ({proc}) {
    const uiState = _.get(proc, ['uiState'], {})
    return (
      <Proc
        key={proc.id}
        proc={proc}
        actions={this.props.actions}
        style={{
          position: 'absolute',
          left: _.get(uiState, ['position', 'x'], 0),
          top: _.get(uiState, ['position', 'y'], 0),
        }}
        afterMount={(el) => {
          this.procRefs[proc.id] = el
          interact(el.labelRef.current).draggable({
            restrict: false,
            autoScroll: true,
            onmove: (dragEvent) => {
              const currentPos = _.get(
                this.props.program.procs,
                [proc.id, 'uiState', 'position'],
                {x: 0, y: 0}
              )
              this.props.actions.updateProcUiState({
                procId: proc.id,
                updates: {
                  position: {
                    x: currentPos.x + dragEvent.dx,
                    y: currentPos.y + dragEvent.dy
                  }
                }
              })
            }
          })
        }}
        beforeUnmount={() => { delete this.procRefs[proc.id] }}
      />
    )
  }

  renderWires ({wires}) {
    return (
      <svg
        ref={this.wiresContainerRef}
        className='wires-container'
        style={{
          position: 'absolute',
          overflow: 'visible',
          left: 0,
          right: 0,
          top: 0,
          zIndex: -1,
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
      const destProcRef = this.procRefs[dest.procId]
      if (!srcProcRef || !destProcRef) { return }
      const containerRect = this.wiresContainerRef.current.getBoundingClientRect()
      const _getOffsetPos = (rect) => ({
        x: rect.x - containerRect.x,
        y: rect.y - containerRect.y + (rect.height / 2)
      })
      const srcRect = srcProcRef.getPortBoundingRect({portId: src.portId})
      const srcPos = _getOffsetPos(srcRect)
      const destRect = destProcRef.getPortBoundingRect({portId: dest.portId})
      const destPos = _getOffsetPos(destRect)
      const wireRef = this.wireRefs[wire.id]
      wireRef.setPositions({src: srcPos, dest: destPos})
    })
  }
}

export default Program

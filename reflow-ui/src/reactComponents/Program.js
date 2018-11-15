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
    this.progContainerRef = React.createRef()
    this.dragatarRef = React.createRef()
    this.wiresContainerRef = React.createRef()
    this._wiresFromProc = {}
    this._wiresToProc = {}
    this._procDragState = null
    this._wireDrawState = null
  }

  render () {
    const { program, style } = this.props
    if (! program) { return null } 
    return (
      <div
        ref={this.progContainerRef}
        className='program' style={style || {}}
      >
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
        <div
          ref={this.dragatarRef}
          style={{
            visibility: 'hidden',
            position: 'absolute',
            border: 'medium dashed orange',
            width: 100,
            height: 100,
          }}
        />
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
        afterMount={(el) => { this.procRefs[proc.id] = el }}
        beforeUnmount={() => {
          interact(this.procRefs[proc.id].labelRef.current).unset()
          delete this.procRefs[proc.id]
        }}
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
    this._setupProcDragState()
    this._setupWireDrawState()
    this._updateProcs()
    this._updateWires()
  }

  _setupProcDragState() {
    this._procDragState = {
      dragatar: {
        getDOMNode: (() => this.dragatarRef.current),
        updateStyle: (style) => {
          const domNode = this._procDragState.dragatar.getDOMNode()
          _.each(style, (val, key) => {
            domNode.style[key] = val
          })
        },
        incrementPos: ({x, y}) => {
          const currentPos = this._procDragState.dragatar.pos
          const nextPos = {x: currentPos.x + x, y: currentPos.y + y}
          this._procDragState.dragatar.setPos(nextPos)
        },
        setPos: (pos) => {
          this._procDragState.dragatar.pos = pos
          this._procDragState.dragatar.updateStyle({
            left: pos.x + 'px',
            top: pos.y + 'px',
          })
        }
      },
      reset: () => {
        this._procDragState = {
          ...this._procDragState,
          dragatar: {
            ...this._procDragState.dragatar,
            startPos: null,
            procId: null,
            pos: null,
          },
          before: null,
          after: null,
        }
        if (this._procDragState.dragatar.getDOMNode()) {
          this._procDragState.dragatar.updateStyle({visibility: 'hidden'})
        }
      }
    }
    this._procDragState.reset()

    //extra scroll handling per: https://github.com/taye/interact.js/issues/568
    interact(this.progContainerRef.current).on('scroll', () => {
      const procDragState = this._procDragState
      if (!(procDragState.dragatar.procId)) { return }
      const currentScroll = {
        x: this.progContainerRef.current.scrollLeft,
        y: this.progContainerRef.current.scrollTop
      }
      procDragState.before = procDragState.after || currentScroll
      procDragState.after = currentScroll
      this._procDragState.dragatar.incrementPos({
        x: (procDragState.after.x - procDragState.before.x),
        y: (procDragState.after.y - procDragState.before.y),
      })
    })
  }

  _setupWireDrawState() {
    this._wireDrawState = {}
  }

  componentDidUpdate (prevProps) {
    this._updateWires()
    this._updateProcs()
  }

  _updateProcs () {
    _.each(this.procRefs, (procRef, procId) => {
      if (procRef._dragified) { return }
      interact(procRef.labelRef.current).draggable({
        restrict: false,
        autoScroll: { container: this.progContainerRef.current },
        onstart: () => {
          this._procDragState.dragatar.procId = procId
          const procContainerNode = procRef.containerRef.current
          const procRect = procContainerNode.getBoundingClientRect()
          this._procDragState.dragatar.updateStyle({
            visibility: 'visible',
            width: procRect.width + 'px',
            height: procRect.height + 'px',
          })
          const startPos = {
            x: parseFloat(procContainerNode.style.left),
            y: parseFloat(procContainerNode.style.top),
          }
          this._procDragState.dragatar.setPos(startPos)
          this._procDragState.dragatar.startPos = startPos
        },
        onend: () => {
          const currentPos = (
            this.props.program.procs[procId].uiState.position
            || {x: 0, y: 0}
          )
          const dragatar = this._procDragState.dragatar
          const nextPos = _.mapValues(currentPos, (curValue, xy) => {
            const delta = dragatar.pos[xy] - dragatar.startPos[xy]
            return curValue + delta
          })
          this.props.actions.updateProcUiState({
            procId,
            updates: { position: nextPos }
          })
          this._procDragState.reset()
        },
        onmove: (event) => {
          this._procDragState.dragatar.incrementPos({x: event.dx, y: event.dy})
        }
      })
      procRef._dragified = true
    })
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

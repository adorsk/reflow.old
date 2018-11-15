import React from 'react'
import _ from 'lodash'
import interact from 'interactjs'

import { getPagePos } from '../utils.js'

import Proc from './Proc.js'
import Wire from './Wire.js'


class Program extends React.Component {
  constructor (props) {
    super(props)
    this.procRefs = {}
    this.wireRefs = {}
    this.progContainerRef = React.createRef()
    this.procAvatarRef = React.createRef()
    this.wiresContainerRef = React.createRef()
    this.wireAvatarRef = React.createRef()
    this._wiresFromProc = {}
    this._wiresToProc = {}
    this._procDragMgr = null
    this._wireDrawMgr = null
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
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
          }}
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
          ref={this.procAvatarRef}
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
      <div
        className='wires-container'
        ref={this.wiresContainerRef}
        style={{
          position: 'absolute',
          overflow: 'visible',
          left: 0,
          right: 0,
          top: 0,
          pointerEvents: 'none',
        }}
      >
        <svg
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            overflow: 'visible'
          }}
        >
          <Wire
            ref={this.wireAvatarRef}
            style={{stroke: 'orange'}}
          />
          {
            _.map(wires, (wire) => {
              return this.renderWire({wire})
            })
          }
        </svg>
      </div>
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
    this._setupProcDragMgr()
    this._setupWireDrawMgr()
    this._updateProcs()
    this._updateWires()
  }

  _setupProcDragMgr() {
    this._procDragMgr = {
      avatar: {
        el: this.procAvatarRef.current,
        updateStyle: (style) => {
          _.each(style, (val, key) => {
            this._procDragMgr.avatar.el.style[key] = val
          })
        },
        incrementPos: ({x, y}) => {
          const currentPos = this._procDragMgr.avatar.pos
          const nextPos = {x: currentPos.x + x, y: currentPos.y + y}
          this._procDragMgr.avatar.setPos(nextPos)
        },
        setPos: (pos) => {
          this._procDragMgr.avatar.pos = pos
          this._procDragMgr.avatar.updateStyle({
            left: pos.x + 'px',
            top: pos.y + 'px',
          })
        }
      },
      reset: () => {
        this._procDragMgr = {
          ...this._procDragMgr,
          avatar: {
            ...this._procDragMgr.avatar,
            startPos: null,
            procId: null,
            pos: null,
          },
          before: null,
          after: null,
        }
        this._procDragMgr.avatar.updateStyle({visibility: 'hidden'})
      }
    }
    this._procDragMgr.reset()

    //extra scroll handling per: https://github.com/taye/interact.js/issues/568
    interact(this.progContainerRef.current).on('scroll', () => {
      const procDragMgr = this._procDragMgr
      if (!(procDragMgr.avatar.procId)) { return }
      const currentScroll = {
        x: this.progContainerRef.current.scrollLeft,
        y: this.progContainerRef.current.scrollTop
      }
      procDragMgr.before = procDragMgr.after || currentScroll
      procDragMgr.after = currentScroll
      this._procDragMgr.avatar.incrementPos({
        x: (procDragMgr.after.x - procDragMgr.before.x),
        y: (procDragMgr.after.y - procDragMgr.before.y),
      })
    })
  }

  _setupWireDrawMgr() {
    const mgr = {
      isDrawing: false,
      isPortHandleEl: (el) => el.classList.contains('port-handle'),
      getPortInfoFromEl: ((el) => ({
        procId: el.dataset.procid,
        portId: el.dataset.portid,
      })),
      avatar: {
        ref: this.wireAvatarRef.current,
        positions: {src: null, dest: null},
      },
      wireSrc: null,
      containerEl: this.progContainerRef.current,
      containerPagePos: null,
      getRelativePos: (pagePos) => {
        return {
          x: pagePos.x - mgr.containerPagePos.x,
          y: pagePos.y - mgr.containerPagePos.y,
        }
      },
      startDrawing: (evt) => {
        mgr.containerPagePos = getPagePos(mgr.containerEl)
        if (mgr.isPortHandleEl(evt.target)) {
          mgr.isDrawing = true
          const {portId, procId} = mgr.getPortInfoFromEl(evt.target)
          mgr.wireSrc = {portId, procId}
          const procRef = this.procRefs[procId]
          mgr.avatar.positions.src = mgr.getRelativePos(
            procRef.getPortHandlePagePos({portId}))
          mgr.containerEl.addEventListener('mousemove', mgr.onDrawMove)
        }
      },
      onDrawMove: (evt) => {
        mgr.avatar.positions.dest = mgr.getRelativePos({
          x: evt.pageX + mgr.containerEl.scrollLeft,
          y: evt.pageY + mgr.containerEl.scrollTop
        })
        mgr.avatar.ref.setPositions(mgr.avatar.positions)
      },
      endDrawing: (evt) => {
        if (mgr.isPortHandleEl(evt.target)) {
          const {portId, procId} = mgr.getPortInfoFromEl(evt.target)
          const procRef = this.procRefs[procId]
          mgr.avatar.positions.dest = mgr.getRelativePos(
            procRef.getPortHandlePagePos({portId}))
          this.props.actions.addWire({
            wire: {
              src: mgr.wireSrc,
              dest: {procId, portId}
            }
          })
        }
        mgr.containerEl.removeEventListener('mousemove', mgr.onDrawMove)
        mgr.isDrawing = false
      },
    }
    mgr.containerEl.addEventListener('click', (evt) => {
      (mgr.isDrawing) ? mgr.endDrawing(evt) : mgr.startDrawing(evt)
    })
    this._wireDrawMgr = mgr
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
          this._procDragMgr.avatar.procId = procId
          const procContainerEl = procRef.containerRef.current
          const procRect = procContainerEl.getBoundingClientRect()
          this._procDragMgr.avatar.updateStyle({
            visibility: 'visible',
            width: procRect.width + 'px',
            height: procRect.height + 'px',
          })
          const startPos = {
            x: parseFloat(procContainerEl.style.left),
            y: parseFloat(procContainerEl.style.top),
          }
          this._procDragMgr.avatar.setPos(startPos)
          this._procDragMgr.avatar.startPos = startPos
        },
        onend: () => {
          const currentPos = (
            this.props.program.procs[procId].uiState.position
            || {x: 0, y: 0}
          )
          const avatar = this._procDragMgr.avatar
          const nextPos = _.mapValues(currentPos, (curValue, xy) => {
            const delta = avatar.pos[xy] - avatar.startPos[xy]
            return curValue + delta
          })
          this.props.actions.updateProcUiState({
            procId,
            updates: { position: nextPos }
          })
          this._procDragMgr.reset()
        },
        onmove: (event) => {
          this._procDragMgr.avatar.incrementPos({x: event.dx, y: event.dy})
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
      const containerPagePos = getPagePos(this.wiresContainerRef.current)
      const _getRelPos = (pagePos) => ({
        x: pagePos.x - containerPagePos.x,
        y: pagePos.y - containerPagePos.y,
      })
      this.wireRefs[wire.id].setPositions({
        src: _getRelPos(
          srcProcRef.getPortHandlePagePos({portId: src.portId })
        ),
        dest: _getRelPos(
          destProcRef.getPortHandlePagePos({portId: dest.portId})
        ),
      })
    })
  }
}

export default Program

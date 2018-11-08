import _ from 'lodash'
import Store from 'reflow-store/src/Store.js'

import * as constants from './constants.js'
import NoopComponent from './components/Noop.js'


const Statuses = {
  RESOLVED: 'RESOLVED',
}

class Program {
  constructor () {
    this.props = {}
    this.store = new Store()
    this.store.actions.program.create({id: 'mainProgram'})
    this._addRootProc()
    this._tickCounter = 0
    this._packetCounter = 0
  }

  _addRootProc () {
    this.addProc({
      id: constants.rootProcId,
      component: NoopComponent.getInstance(),
      status: Statuses.RESOLVED,
    })
  }

  addProc (proc) {
    this.store.actions.proc.create(proc)
  }

  addWire (wire) {
    this.store.actions.wire.create(wire)
  }

  sendInputsToProc ({procId, inputs}) {
    for (let portId of Object.keys(inputs)) {
      const packet = inputs[portId]
      const rootProcPortId = [procId, portId].join(':')
      this.store.actions.wire.create({
        src: {
          procId: constants.rootProcId,
          portId: rootProcPortId
        },
        dest: {procId, portId}
      })
      this._updateProcOutputs({
        procId: constants.rootProcId,
        updates: { [rootProcPortId]: packet }
      })
    }
  }

  _updateProcOutputs ({procId, updates}) {
    const updatesWithIdxs = _.mapValues(updates, (packet) => {
      return {packet: {...packet, idx: this._packetCounter++}}
    })
    return this.store.actions.proc.updateOutputs({
      id: procId,
      updates: updatesWithIdxs
    })
  }

  run () {
    console.log('run')
    const keepAliveTimer = setInterval(() => null, 100)

    const runPromise = new Promise((resolve, reject) => {
      this.store.subscribe(_.debounce(() => {
        const state = this.store.getState()
        const prevProps = this.props
        this.props = this._mapStateToProps({state, prevProps})
        if (this.props.program.status === Statuses.RESOLVED) {
          resolve()
        } else {
          this._tick({prevProps})
        }
      }, 0))

      // initial tick
      const prevProps = {}
      this.props = this._mapStateToProps({
        state: this.store.getState(),
        prevProps
      })
      this._tick({prevProps})
    })

    return runPromise.then((...args) => {
      clearInterval(keepAliveTimer)
      return args
    })
  }


  _mapStateToProps ({state, prevProps}) {
    return {
      program: this.store.selectors.program(state),
      procs: this.store.selectors.procs(state),
      inputs: this.store.selectors.inputs(state, {prevInputs: prevProps.inputs}),
    }
  }

  _tick({prevProps}) {
    console.debug('_tick', this._tickCounter++)
    for (let procId of _.keys(this.props.procs)) {
      this._tickProc({procId})
    }
    if (!this._hasUnresolvedProcs()) {
      this.store.actions.program.update({
        id: this.props.program.id,
        updates: { status: Statuses.RESOLVED }
      })
    }
  }

  _hasUnresolvedProcs () {
    return _.some(this.props.procs, (proc) => (proc.status !== Statuses.RESOLVED))
  }

  _tickProc ({procId}) {
    const proc = this.props.procs[procId]
    proc.component.tick({
      inputs: (this.props.inputs[procId] || {}),
      updateOutputs: (updates) => {
        this._updateProcOutputs({procId, updates})
      },
      resolve: () => {
        this._updateProcStatus({procId, status: 'RESOLVED'})
      },
    })
  }

  _updateProcStatus ({procId, status}) {
    return this.store.actions.proc.update({
      id: procId,
      updates: {status}
    })
  }
}

export default Program

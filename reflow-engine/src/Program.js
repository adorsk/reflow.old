import _ from 'lodash'
import Store from 'reflow-store/src/Store.js'

import * as constants from './constants.js'
import NoopComponent from './components/Noop.js'


const Statuses = {
  RESOLVED: 'RESOLVED',
}

class Program {
  constructor (opts = {}) {
    this._prevProcs = {}
    this.store = opts.store || this._createStore()
    this.store.actions.program.create({id: 'mainProgram'})
    this._addRootProc()
    this._tickCounter = 0
    this._packetCounter = 0
  }

  _createStore () {
    return new Store()
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

  updateDerivedState () {
    this.derivedState = this.store.getDerivedState()
  }

  getProcs () {
    this.updateDerivedState()
    return _.get(this.derivedState, ['program', 'procs'], {})
  }

  updateProc ({id, updates}) {
    this.store.actions.proc.update({id, updates})
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
        this.updateDerivedState()
        if (this.derivedState.program.status === Statuses.RESOLVED) {
          resolve()
        } else {
          this._tick({derivedState: this.derivedState})
        }
      }, 0))
      // initial tick
      this.updateDerivedState()
      this._tick({derivedState: this.derivedState})
    })

    return runPromise.then((...args) => {
      clearInterval(keepAliveTimer)
      return args
    })
  }

  _tick({derivedState = {}}) {
    console.debug('_tick', this._tickCounter++)
    const { program } = derivedState
    if (! program) { return }
    for (let proc of _.values(program.procs)) {
      this._tickProc({proc})
    }
    this._prevProcs = program.procs
    if (!this._hasUnresolvedProcs({program})) {
      this.store.actions.program.update({
        id: program.id,
        updates: { status: Statuses.RESOLVED }
      })
    }
    this._prevProcs = program.procs
  }

  _hasUnresolvedProcs ({program}) {
    return _.some(program.procs, (proc) => (proc.status !== Statuses.RESOLVED))
  }

  _tickProc ({proc}) {
    proc.component.tick({
      state: _.get(proc, ['state'], {}),
      inputs: _.get(proc, ['inputs'], {}),
      prevInputs: _.get(this._prevProcs, [proc.id, 'inputs'], {}),
      updateOutputs: (updates) => {
        this._updateProcOutputs({procId: proc.id, updates})
      },
      resolve: () => {
        this._updateProcStatus({procId: proc.id, status: 'RESOLVED'})
      },
      updateState: (updates) => {
        this._updateProcState({procId: proc.id, updates})
      }
    })
  }

  _updateProcStatus ({procId, status}) {
    return this.store.actions.proc.update({
      id: procId,
      updates: {status}
    })
  }

  _updateProcState ({procId, updates}) {
    return this.store.actions.proc.updateState({id: procId, updates: updates})
  }
}

export default Program

import _ from 'lodash'

import * as constants from './constants.js'
import NoopComponent from './components/Noop.js'
import Store from './store/Store.js'
import Resolver from './Resolver.js'


const Statuses = {
  RESOLVED: 'RESOLVED',
  RUNNING: 'RUNNING',
}

class ProgramEngine {
  constructor (opts = {}) {
    this._prevProcs = {}
    this.store = opts.store || this._createStore()
    this.resolver = opts.resolver || this._createResolver()
    this.store.actions.program.create({id: 'mainProgram'})
    this._addRootProc()
    this._tickCounter = 0
    this._packetCounter = 0
  }

  _createStore () {
    return new Store()
  }

  _createResolver () {
    return new Resolver()
  }

  _addRootProc () {
    this.addProc({
      id: constants.rootProcId,
      component: NoopComponent.getInstance(),
      status: Statuses.RESOLVED,
      hidden: true,
    })
  }

  async addProc (proc) {
    await this._ensureProcTickFns({procs: [proc]})
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
      this.updateProcOutputs({
        procId: constants.rootProcId,
        updates: { [rootProcPortId]: packet }
      })
    }
  }

  updateProcOutputs ({procId, updates}) {
    const updatesWithIdxs = _.mapValues(updates, (packet) => {
      return {packet: {...packet, idx: this._packetCounter++}}
    })
    return this.store.actions.proc.updateOutputs({
      id: procId,
      updates: updatesWithIdxs
    })
  }

  async run () {
    console.log('run')
    const keepAliveTimer = setInterval(() => null, 100)
    this.updateDerivedState()
    await this._ensureProcTickFns({procs: this.derivedState.program.procs})
    const runPromise = new Promise((resolve, reject) => {
      this.store.subscribe(_.debounce(() => {
        this.updateDerivedState()
        if (this.derivedState.program.status === Statuses.RESOLVED) {
          resolve()
        } else {
          this._tick({derivedState: this.derivedState})
        }
      }, 0))
      this.updateDerivedState()
      this._tick({derivedState: this.derivedState})
    })

    return runPromise.then((...args) => {
      clearInterval(keepAliveTimer)
      return args
    })
  }

  async _ensureProcTickFns({procs}) {
    const tickFnPromises = _.values(procs).map(async (proc) => {
      try {
        const component = proc.component
        if (component && component.getTickFn) {
          proc.component.tickFn = await component.getTickFn()
        }
      } catch (e) {
        throw new Error(
          `Could not resolve tickFn for proc ${proc.id}.`
          + ` Error was: ${e}`
        )
      }
    })
    return Promise.all(tickFnPromises)
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
    const tickFn = _.get(proc, ['component', 'tickFn'])
    if (! tickFn) { return }
    const inputs = _.get(proc, ['inputs'], {})
    const prevInputs = _.get(this._prevProcs, [proc.id, 'inputs'], {})
    const inputsUnchanged = (inputs.__version === prevInputs.__version)
    const isResolved = (proc.status === Statuses.RESOLVED)
    if (inputsUnchanged && isResolved) { return }
    this._updateProcStatus({procId: proc.id, status: Statuses.RUNNING})
    tickFn({
      state: _.get(proc, ['state'], {}),
      inputs: _.get(proc, ['inputs'], {}),
      prevInputs,
      updateOutputs: (updates) => {
        this.updateProcOutputs({procId: proc.id, updates})
      },
      resolve: () => {
        this._updateProcStatus({procId: proc.id, status: Statuses.RESOLVED})
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

  async resolveProcFromSpec({procSpec}) {
    const proc = await this.resolver.resolve({spec: procSpec})
    if (!proc.component && proc.componentSpec) {
      proc.component = await this.resolver.resolve({spec: proc.componentSpec})
    }
    return proc
  }
}

export default ProgramEngine

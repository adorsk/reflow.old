import _ from 'lodash'

import * as constants from './constants.js'
import NoopComponent from './components/Noop.js'
import Store from './store/Store.js'
import ComponentLibrary from './ComponentLibrary.js'
import SerDes from './SerDes.js'


const Statuses = {
  RESOLVED: 'RESOLVED',
  RUNNING: 'RUNNING',
}

class ProgramEngine {
  constructor (opts = {}) {
    this.store = opts.store || this._createStore()
    this.componentLibrary = opts.componentLibrary || this._createComponentLibrary()
    this.store.actions.program.create({id: 'mainProgram'})
    this._addRootProc()
    this.tickCount = 0
    this.packetCount = 0
    this.prevInputsByProcId = null
  }

  _createStore () { return new Store() }
  _createComponentLibrary () { return new ComponentLibrary() }

  _addRootProc () {
    this.addProc({
      id: constants.rootProcId,
      component: NoopComponent.getInstance(),
      status: Statuses.RESOLVED,
      hidden: true,
    })
  }

  async addProc (proc) {
    const procWithComponent= {
      ...proc,
      component: await this.componentLibrary.get({key: proc.componentId})
    }
    await this._ensureProcTickFns({procs: [procWithComponent]})
    this.store.actions.proc.create(procWithComponent)
  }

  addWire (wire) {
    this.store.actions.wire.create(wire)
  }

  getProgram () {
    return this.store.getProgram()
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
      return {packet: {...packet, idx: this.packetCount++}}
    })
    return this.store.actions.proc.updateOutputs({
      id: procId,
      updates: updatesWithIdxs
    })
  }

  async run (opts = {}) {
    console.log('run')
    const { maxTicks } = opts
    const runPromise = new Promise((resolve, reject) => {
      const onStoreChange = () => {
        const program = this.getProgram()
        if (maxTicks && this.tickCount > maxTicks) {
          throw new Error('exceeded max ticks')
        }
        if (program.status === Statuses.RESOLVED) { resolve() }
        else { this._tick({program}) }
      }
      // The debounce is important: it allows us avoid infinite recursion
      // by consolidating ticks. We only do the next tick when 
      // state updates for the current tick have finished.
      this.store.subscribe(_.debounce(onStoreChange), 0)
      this._tick({program: this.getProgram()})
    })
    this._tick({program: this.getProgram()}) // initial tick
    return runPromise
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

  _tick({program = {}}) {
    console.debug('_tick', this.tickCount++)
    if (! program) { return }
    const prevInputsByProcId = this.store.getInputsByProcId()
    for (let proc of _.values(program.procs)) { this._tickProc({proc}) }
    if (!this._hasUnresolvedProcs({program})) {
      this.store.actions.program.update({
        id: program.id,
        updates: { status: Statuses.RESOLVED }
      })
    }
    this.prevInputsByProcId = prevInputsByProcId
  }

  _hasUnresolvedProcs ({program}) {
    return _.some(program.procs, (proc) => (proc.status !== Statuses.RESOLVED))
  }

  _tickProc ({proc}) {
    const tickFn = _.get(proc, ['component', 'tickFn'])
    if (! tickFn) { return }
    const inputs = _.get(proc, ['inputs'], {})
    const prevInputs = _.get(this.prevInputsByProcId, proc.id, {})
    const inputsUnchanged = (inputs.__version === prevInputs.__version)
    const isResolved = (proc.status === Statuses.RESOLVED)
    if (inputsUnchanged && isResolved) { return }
    this._updateProcStatus({procId: proc.id, status: Statuses.RUNNING})
    tickFn({
      inputs: {
        current: inputs,
        prev: prevInputs,
        fresh: this._computeFreshInputs({currentInputs: inputs, prevInputs}),
      },
      state: _.get(proc, ['state'], {}),
      actions: {
        updateOutputs: (packetsByPort) => {
          this.updateProcOutputs({
            procId: proc.id,
            updates: _.mapValues(packetsByPort, (packet) => {
              return this._sanitizePacket(packet)
            })
          })
        },
        resolve: () => {
          this._updateProcStatus({procId: proc.id, status: Statuses.RESOLVED})
        },
        updateState: (updates) => {
          this._updateProcState({procId: proc.id, updates})
        }
      },
      constants: {PacketTypes: constants.PacketTypes}
    })
  }

  _updateProcStatus ({procId, status}) {
    return this.store.actions.proc.update({
      id: procId,
      updates: {status}
    })
  }

  _computeFreshInputs ({currentInputs, prevInputs}) {
    const freshInputs = {}
    for (let key of _.keys(currentInputs)) {
      if (
        (!(key in prevInputs))
        || (_.get(currentInputs[key], 'idx') !== _.get(prevInputs[key], 'idx'))
      ) { freshInputs[key] = currentInputs[key] }
    }
    return freshInputs
  }

  _sanitizePacket (packet) {
    if (packet && !packet.packetType) {
      packet = {
        packetType: constants.PacketTypes.DATA,
        data: packet
      }
    }
    return packet
  }

  _updateProcState ({procId, updates}) {
    return this.store.actions.proc.updateState({id: procId, updates: updates})
  }
}

export default ProgramEngine

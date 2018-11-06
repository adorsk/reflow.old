import _ from 'lodash'

import Store from './Store.js'
import * as constants from './constants.js'
import NoopComponent from './components/Noop.js'

class Program {
  constructor () {
    this.props = {}
    this.store = new Store()
    this._addRootProc()
  }

  _addRootProc () {
    this.addProc({
      id: constants.rootProcId,
      component: NoopComponent.getInstance(),
    })
  }

  addProc (procDef) {
    this.store.addProcDef(procDef)
  }

  addWire (wire) {
    this.store.addWire(wire)
  }

  updateProcInputs ({procId, values}) {
    console.log('updateProcInputs')
    for (let valueKey of Object.keys(values)) {
      const value = values[valueKey]
      const portId = [procId, valueKey].join(':')

      // Get or create wire
      const wireDef = {
        src: {
          procId: constants.rootProcId,
          ioId: portId,
        },
        dest: {
          procId,
          ioId: valueKey
        },
      }
      const wireId = this.store.getWireId(wireDef)
      let wire = this.store.getWire(wireDef) || this.store.addWire(wireDef)

      // set output on root port.
      this._updateProcOutputs({
        procId: constants.rootProcId,
        values: { [portId]: value }
      })
    }
  }

  _updateProcOutputs (...args) {
    return this.store.updateProcOutputs(...args)
  }

  run () {
    console.log('run')
    this.store.subscribe(_.debounce(this._onStateChange.bind(this), 0))
  }

  _onStateChange ({state}) {
    const prevProps = this.props
    this.props = this._mapStateToProps({state, prevProps})
    this._tick({prevProps})
  }

  _mapStateToProps ({state, prevProps}) {
    const procStates = {}
    for (let procId of Object.keys(state.procDefs)) {
      const procDef = state.procDefs[procId]
      procStates[procId] = {
        id: procId,
        component: procDef.component,
        inputs: null, // COMPUTE THIS!
        outputs: state.outputs[procId] || {},
      }
    }
    return {
      procStates,
      wires: state.wires,
    }
  }

  _tick({prevProps}) {
    // Tick dirty procs
    console.log('tick')
  }
}

export default Program

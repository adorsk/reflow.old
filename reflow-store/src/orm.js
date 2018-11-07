import { ORM, Model, fk } from 'redux-orm'
import _ from 'lodash'

import { actionTypes } from './actionTypes.js'
import * as utils from './utils.js'

export class Program extends Model {
  static reducer (action, Program) {
    const { payload, type } = action
    if (type === actionTypes.program.create) {
        Program.create(payload)
    } else if (type === actionTypes.program.update) {
      const { id, updates} = payload
      Program.withId(id).update(updates)
    }
  }
}
Program.modelName = 'Program'

export class Proc extends Model {
  constructor (...args) {
    super(...args)
    this._packetCounter = 0
  }
  static reducer (action, Proc) {
    const { payload, type } = action
    if (type === actionTypes.proc.create) {
      Proc.create(payload)
    } else if (type === actionTypes.proc.update) {
      const { id, updates } = payload
      Proc.withId(id).update(updates)
    } else if (type === actionTypes.proc.delete) {
      const { id } = payload
      Proc.withId(id).delete()
    } else if (type === actionTypes.proc.updateOutputs) {
      const { id, updates } = payload
      const proc = Proc.withId(id)
      const updatesWithIdxs = _.mapValues(updates, (packet) => {
        return {packet: {...packet, idx: proc._packetCounter++}}
      })
      proc.update({
        outputs: Object.assign({}, proc.outputs, updatesWithIdxs)
      })
    }
  }
}
Proc.modelName = 'Proc'

export class Wire extends Model {
  static reducer (action, Wire) {
    const { payload, type } = action
    if (type === actionTypes.wire.create) {
      const wire  = payload
      const id = utils.getWireId(wire)
      Wire.create({id, ...wire})
    } else if (type === actionTypes.wire.delete) {
      const { id } = payload
      Wire.withId(id).delete()
    }
  }
}
Wire.modelName = 'Wire'

export const orm = new ORM()
orm.register(Proc, Wire, Program)

export default orm

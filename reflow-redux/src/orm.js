import { ORM, Model, fk } from 'redux-orm'

import { actionTypes } from './actionTypes.js'

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
      proc.update({outputs: Object.assign({}, proc.outputs, updates)})
    }
  }
}
Proc.modelName = 'Proc'
Proc.fields = {program: fk('Program')}

export class Wire extends Model {
  static reducer (action, Wire) {
    const { payload, type } = action
    if (type === actionTypes.wire.create) {
      const { program, srcProc, srcPort, destProc, destPort } = payload
      const id = `${srcProc.id}:${srcPort} -> ${destProc.id}:${destPort}`
      Wire.create({id, program: program.id, src, dest})
    } else if (type === actionTypes.wire.delete) {
      const { id } = payload
      Wire.withId(id).delete()
    }
  }
}
Wire.modelName = 'Wire'
Wire.fields = {
  program: fk('Program'),
  srcProc: fk('Proc', 'outgoingWires'),
  destProc: fk('Proc', 'incomingWires'),
}

export const orm = new ORM()
orm.register(Proc, Wire, Program, Output)

export default orm

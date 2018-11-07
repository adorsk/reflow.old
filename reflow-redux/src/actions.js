import { actionTypes } from './actionTypes.js'

const actions = {}

actions.program = {
  create: ({props}) => ({
    type: actionTypes.program.create,
    payload: props,
  }),
  update: ({id, updates}) => ({
    type: actionTypes.program.update,
    payload: {id, updates}
  }),
}

actions.proc = {
  create: ({props}) => ({
    type: actionTypes.proc.create,
    payload: props,
  }),
  update: ({id, updates}) => ({
    type: actionTypes.proc.update,
    payload: {id, updates}
  }),
  delete: ({id}) => ({
    type: actionTypes.proc.delete,
    payload: {id},
  }),
  updateOutputs: ({id, updates}) => {
    console.log('@TODO')
  },
}

actions.wire = {
  create: ({props}) => ({
    type: actionTypes.wire.create,
    payload: props,
  }),
  delete: ({id}) => ({
    type: actionTypes.wire.delete,
    payload: { id },
  }),
}

actions.output = {
  create: ({props}) => ({
    type: actionTypes.output.create,
    payload: props,
  }),
  update: ({id, updates}) => ({
    type: actionTypes.output.update,
    payload: {id, updates}
  }),
  delete: ({id}) => ({
    type: actionTypes.output.delete,
    payload: {id},
  }),
}

export default actions

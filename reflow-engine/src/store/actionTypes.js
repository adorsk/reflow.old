function _generatePrefixedActionTypes ({prefix, actionTypes}) {
  const prefixedActionTypes = {}
  for (let actionType of actionTypes) {
    prefixedActionTypes[actionType] = [prefix, actionType].join(':')
  }
  return prefixedActionTypes
}

export const actionTypes = {}

const crudActionTypes = ['create', 'update', 'delete']

actionTypes.program = _generatePrefixedActionTypes({
  prefix: 'program',
  actionTypes: crudActionTypes,
})

actionTypes.proc = _generatePrefixedActionTypes({
  prefix: 'proc',
  actionTypes: [...crudActionTypes, 'updateOutputs', 'updateState'],
})

actionTypes.wire = _generatePrefixedActionTypes({
  prefix: 'wire',
  actionTypes: crudActionTypes,
})

export default actionTypes
